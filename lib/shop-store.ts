import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { emptyShop, type StoredShop } from "./basket";
import type { CheckoutDraft, CheckoutProduct, Order } from "./checkout";
import { orderTransitions, type OrderStatus } from "./order-status";

export function openShopStore(filename: string, now = Date.now) {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS shop_sessions (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS checkout_drafts (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, checkout_id TEXT NOT NULL UNIQUE, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS inventory (product_id INTEGER PRIMARY KEY, title TEXT NOT NULL, stock INTEGER NOT NULL CHECK(stock >= 0));
    CREATE TABLE IF NOT EXISTS reservations (checkout_id TEXT NOT NULL, session_id TEXT NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL CHECK(quantity > 0), expires_at INTEGER NOT NULL, status TEXT NOT NULL, PRIMARY KEY(checkout_id, product_id));
    CREATE INDEX IF NOT EXISTS reservation_stock ON reservations(product_id, status, expires_at);
  `);
  const transaction = <T,>(fn: () => T): T => {
    db.exec("BEGIN IMMEDIATE");
    try { const result = fn(); db.exec("COMMIT"); return result; }
    catch (error) { db.exec("ROLLBACK"); throw error; }
  };
  const parseOrder = (data: unknown): Order => {
    const order = JSON.parse(String(data)) as Order;
    return { ...order, status: order.status ?? "paid", events: order.events ?? [{ status: "paid", at: order.createdAt, note: "Imported demo order" }], inventoryCommitted: order.inventoryCommitted ?? false };
  };
  const saveOrder = (order: Order) => db.prepare("UPDATE orders SET data = ? WHERE id = ?").run(JSON.stringify(order), order.id);
  const read = (id: string): StoredShop => {
    const row = db.prepare("SELECT data FROM shop_sessions WHERE id = ?").get(id);
    return row ? JSON.parse(String(row.data)) as StoredShop : emptyShop();
  };
  const saveShop = (id: string, shop: StoredShop) => db.prepare("INSERT INTO shop_sessions VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at").run(id, JSON.stringify(shop), now());
  const orderForCheckout = (sessionId: string, checkoutId: string): Order | null => {
    const row = db.prepare("SELECT data FROM orders WHERE session_id = ? AND checkout_id = ?").get(sessionId, checkoutId);
    return row ? parseOrder(row.data) : null;
  };
  const release = (checkoutId: string) => db.prepare("UPDATE reservations SET status='released' WHERE checkout_id=? AND status='held'").run(checkoutId);
  const expire = () => {
    const expired = db.prepare("SELECT DISTINCT checkout_id FROM reservations WHERE status='held' AND expires_at <= ?").all(now());
    for (const row of expired) {
      const found = db.prepare("SELECT data FROM orders WHERE checkout_id=?").get(row.checkout_id);
      if (found) {
        const order = parseOrder(found.data);
        if (order.status === "pending") {
          order.status = "cancelled"; order.paymentStatus = "simulated-cancelled";
          order.events!.push({ status: "cancelled", at: new Date(now()).toISOString(), note: "Payment reservation expired" });
          saveOrder(order);
        }
      }
      release(String(row.checkout_id));
    }
  };
  const inventory = () => db.prepare(`SELECT i.product_id, i.title, i.stock,
    COALESCE(SUM(CASE WHEN r.status='held' AND r.expires_at > ? THEN r.quantity ELSE 0 END),0) AS reserved
    FROM inventory i LEFT JOIN reservations r ON r.product_id=i.product_id GROUP BY i.product_id ORDER BY i.title`).all(now()).map(row => ({ productId: Number(row.product_id), title: String(row.title), stock: Number(row.stock), reserved: Number(row.reserved), available: Number(row.stock) - Number(row.reserved) }));
  const consume = (checkoutId: string) => {
    const rows = db.prepare("SELECT * FROM reservations WHERE checkout_id=? AND status='held' AND expires_at > ?").all(checkoutId, now());
    if (!rows.length) throw new Error("Stock reservation expired. Return to your basket to reserve the items again.");
    for (const row of rows) {
      const changed = db.prepare("UPDATE inventory SET stock=stock-? WHERE product_id=? AND stock>=?").run(row.quantity, row.product_id, row.quantity);
      if (!changed.changes) throw new Error("Insufficient local stock.");
    }
    db.prepare("UPDATE reservations SET status='consumed' WHERE checkout_id=? AND status='held'").run(checkoutId);
  };
  return {
    read,
    seedInventory(products: CheckoutProduct[]) {
      transaction(() => {
        for (const product of products) {
          if (!Number.isSafeInteger(product.stock) || product.stock < 0) throw new Error("Invalid stock seed.");
          db.prepare("INSERT OR IGNORE INTO inventory VALUES (?, ?, ?)").run(product.id, product.title, product.stock);
        }
      });
    },
    inventory() { return transaction(() => { expire(); return inventory(); }); },
    updateInventoryStock(productId: number, stock: number, expectedStock: number) {
      return transaction(() => {
        expire();
        if (!Number.isSafeInteger(productId) || productId <= 0) throw new Error("Invalid product.");
        if (!Number.isSafeInteger(stock) || stock < 0 || stock > 9999) throw new Error("Stock must be a whole number between 0 and 9,999.");
        if (!Number.isSafeInteger(expectedStock) || expectedStock < 0) throw new Error("Invalid previous stock value.");
        const item = inventory().find(row => row.productId === productId);
        if (!item) throw new Error("Inventory item not found.");
        if (item.stock !== expectedStock) throw new Error("Stock changed since this page loaded. Refresh and try again.");
        if (stock < item.reserved) throw new Error(`Stock cannot be lower than the ${item.reserved} units currently reserved.`);
        db.prepare("UPDATE inventory SET stock=? WHERE product_id=?").run(stock, productId);
        return inventory().find(row => row.productId === productId)!;
      });
    },
    localProducts(products: CheckoutProduct[], checkoutId = "") {
      return transaction(() => {
        expire();
        const stock = inventory();
        const own = db.prepare("SELECT product_id, quantity FROM reservations WHERE checkout_id=? AND status='held' AND expires_at>?").all(checkoutId, now());
        return products.map(product => ({ ...product, stock: (stock.find(row => row.productId === product.id)?.available ?? 0) + Number(own.find(row => row.product_id === product.id)?.quantity ?? 0) }));
      });
    },
    createCheckout(sessionId: string, draft: CheckoutDraft) {
      transaction(() => {
        expire();
        // One active checkout per session; pending orders retain their own holds.
        db.prepare("UPDATE reservations SET status='released' WHERE session_id=? AND status='held' AND checkout_id NOT IN (SELECT checkout_id FROM orders)").run(sessionId);
        const shop = read(sessionId);
        const signature = (lines: { productId: number; variantId: string; quantity: number }[]) => JSON.stringify(lines.map(line => [line.productId, line.variantId, line.quantity]).sort());
        if (signature(shop.lines) !== signature(draft.quote.lines) || shop.delivery !== draft.quote.deliveryMethod) throw new Error("Basket changed. Please review it again.");
        if (draft.expiresAt <= now() || !shop.lines.length) throw new Error("Checkout expired or basket empty.");
        const quantities = new Map<number, number>();
        for (const line of draft.quote.lines) quantities.set(line.productId, (quantities.get(line.productId) ?? 0) + line.quantity);
        const stock = inventory();
        for (const [id, quantity] of quantities) {
          if ((stock.find(row => row.productId === id)?.available ?? 0) < quantity) throw new Error("Insufficient local stock. Please adjust your basket.");
          db.prepare("INSERT INTO reservations VALUES (?, ?, ?, ?, ?, 'held')").run(draft.id, sessionId, id, quantity, draft.expiresAt);
        }
        db.prepare("INSERT INTO checkout_drafts VALUES (?, ?, ?)").run(draft.id, sessionId, JSON.stringify(draft));
      });
    },
    getCheckout(sessionId: string, id: string): CheckoutDraft | null {
      return transaction(() => {
        expire();
        const row = db.prepare("SELECT data FROM checkout_drafts WHERE id=? AND session_id=?").get(id, sessionId);
        const held = db.prepare("SELECT 1 FROM reservations WHERE checkout_id=? AND session_id=? AND status='held' AND expires_at>? LIMIT 1").get(id, sessionId, now());
        return row && held ? JSON.parse(String(row.data)) as CheckoutDraft : null;
      });
    },
    releaseCheckout(sessionId: string, id: string) {
      transaction(() => {
        if (!orderForCheckout(sessionId, id)) db.prepare("UPDATE reservations SET status='released' WHERE session_id=? AND checkout_id=? AND status='held'").run(sessionId, id);
      });
    },
    orderForCheckout(sessionId: string, checkoutId: string) { return transaction(() => { expire(); return orderForCheckout(sessionId, checkoutId); }); },
    getOrder(sessionId: string, id: string): Order | null {
      return transaction(() => { expire(); const row = db.prepare("SELECT data FROM orders WHERE id=? AND session_id=?").get(id, sessionId); return row ? parseOrder(row.data) : null; });
    },
    listOrders(sessionId?: string): Order[] {
      return transaction(() => { expire(); const rows = sessionId === undefined ? db.prepare("SELECT data FROM orders ORDER BY rowid DESC LIMIT 200").all() : db.prepare("SELECT data FROM orders WHERE session_id=? ORDER BY rowid DESC LIMIT 200").all(sessionId); return rows.map(row => parseOrder(row.data)); });
    },
    placeOrder(sessionId: string, checkoutId: string, create: (shop: StoredShop) => Order): Order {
      return transaction(() => {
        expire();
        const existing = orderForCheckout(sessionId, checkoutId);
        if (existing) return existing;
        const shop = read(sessionId);
        const order = create(shop);
        const held = db.prepare("SELECT * FROM reservations WHERE checkout_id=? AND session_id=? AND status='held' AND expires_at>?").all(checkoutId, sessionId, now());
        const quantities = new Map<number, number>();
        for (const line of order.quote.lines) quantities.set(line.productId, (quantities.get(line.productId) ?? 0) + line.quantity);
        if (held.length !== quantities.size || held.some(row => quantities.get(Number(row.product_id)) !== Number(row.quantity))) throw new Error("Reservation expired or released. Return to your basket to reserve the items again.");
        order.status = order.paymentStatus === "simulated-pending" ? "pending" : "paid";
        order.events = [{ status: "pending", at: order.createdAt, note: "Demo order submitted" }];
        order.inventoryCommitted = order.status === "paid";
        if (order.status === "paid") { consume(checkoutId); order.events.push({ status: "paid", at: order.createdAt, note: "Simulated payment approved" }); }
        db.prepare("INSERT INTO orders VALUES (?, ?, ?, ?)").run(order.id, sessionId, checkoutId, JSON.stringify(order));
        shop.lines = []; saveShop(sessionId, shop);
        return order;
      });
    },
    transitionOrder(id: string, target: OrderStatus, expected: OrderStatus, sessionId?: string): Order {
      return transaction(() => {
        expire();
        const row = sessionId === undefined ? db.prepare("SELECT * FROM orders WHERE id=?").get(id) : db.prepare("SELECT * FROM orders WHERE id=? AND session_id=?").get(id, sessionId);
        if (!row) throw new Error("Order not found.");
        const order = parseOrder(row.data);
        if (order.status === target) return order;
        if (order.status !== expected) throw new Error("Order changed. Refresh before updating it.");
        if (!(orderTransitions[order.status!] as readonly string[]).includes(target)) throw new Error("This order transition is not allowed.");
        if (sessionId !== undefined && target !== "cancelled") throw new Error("Only cancellation is available to shoppers.");
        if (target === "paid") { consume(String(row.checkout_id)); order.inventoryCommitted = true; order.paymentStatus = "simulated-paid"; }
        if (target === "cancelled") {
          release(String(row.checkout_id));
          if (order.inventoryCommitted) {
            for (const line of order.quote.lines) db.prepare("UPDATE inventory SET stock=stock+? WHERE product_id=?").run(line.quantity, line.productId);
            order.inventoryCommitted = false;
          }
          order.paymentStatus = order.paymentStatus === "simulated-paid" ? "simulated-refunded" : "simulated-cancelled";
        }
        order.status = target;
        order.events!.push({ status: target, at: new Date(now()).toISOString(), note: sessionId === undefined ? "Updated by administrator" : "Cancelled by shopper" });
        saveOrder(order); return order;
      });
    },
    update(id: string, mutate: (shop: StoredShop) => void): StoredShop {
      return transaction(() => { const shop = read(id); mutate(shop); saveShop(id, shop); return shop; });
    },
    close: () => db.close(),
  };
}
let store: ReturnType<typeof openShopStore> | undefined;
export function getShopStore() {
  return store ??= openShopStore(resolve(/* turbopackIgnore: true */ process.env.MINISTORE_DB_PATH ?? ".data/ministore.sqlite"));
}
