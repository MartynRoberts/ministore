import { Pool, neonConfig, type PoolClient } from "@neondatabase/serverless";
import ws from "ws";
import { emptyShop, type StoredShop } from "./basket";
import type { CheckoutDraft, CheckoutProduct, Order } from "./checkout";
import { orderTransitions, type OrderStatus } from "./order-status";

neonConfig.webSocketConstructor = ws;

type Queryable = Pick<PoolClient, "query">;
type InventoryRow = { productId: number; title: string; stock: number; reserved: number; available: number };

const parseJson = <T,>(value: unknown): T =>
  (typeof value === "string" ? JSON.parse(value) : value) as T;

const parseOrder = (data: unknown): Order => {
  const order = parseJson<Order>(data);
  return {
    ...order,
    status: order.status ?? "paid",
    events: order.events ?? [{ status: "paid", at: order.createdAt, note: "Imported demo order" }],
    inventoryCommitted: order.inventoryCommitted ?? false,
  };
};

export function openNeonShopStore(connectionString: string, now = Date.now) {
  const pool = new Pool({ connectionString });
  const ready = pool.query(`
    CREATE TABLE IF NOT EXISTS shop_sessions (id TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at BIGINT NOT NULL);
    CREATE TABLE IF NOT EXISTS checkout_drafts (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, checkout_id TEXT NOT NULL UNIQUE, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS inventory (product_id INTEGER PRIMARY KEY, title TEXT NOT NULL, stock INTEGER NOT NULL CHECK(stock >= 0));
    CREATE TABLE IF NOT EXISTS reservations (checkout_id TEXT NOT NULL, session_id TEXT NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL CHECK(quantity > 0), expires_at BIGINT NOT NULL, status TEXT NOT NULL, PRIMARY KEY(checkout_id, product_id));
    CREATE INDEX IF NOT EXISTS reservation_stock ON reservations(product_id, status, expires_at);
    CREATE INDEX IF NOT EXISTS orders_session_created ON orders(session_id, created_at DESC);
  `);

  const transaction = async <T,>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
    await ready;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  const readTx = async (db: Queryable, id: string): Promise<StoredShop> => {
    const { rows } = await db.query("SELECT data FROM shop_sessions WHERE id = $1", [id]);
    return rows[0] ? parseJson<StoredShop>(rows[0].data) : emptyShop();
  };
  const saveShopTx = async (db: Queryable, id: string, shop: StoredShop) => {
    await db.query(`INSERT INTO shop_sessions (id, data, updated_at) VALUES ($1, $2::jsonb, $3)
      ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at`, [id, JSON.stringify(shop), now()]);
  };
  const saveOrderTx = async (db: Queryable, order: Order) => {
    await db.query("UPDATE orders SET data=$1::jsonb WHERE id=$2", [JSON.stringify(order), order.id]);
  };
  const orderForCheckoutTx = async (db: Queryable, sessionId: string, checkoutId: string): Promise<Order | null> => {
    const { rows } = await db.query("SELECT data FROM orders WHERE session_id=$1 AND checkout_id=$2", [sessionId, checkoutId]);
    return rows[0] ? parseOrder(rows[0].data) : null;
  };
  const releaseTx = async (db: Queryable, checkoutId: string) => {
    await db.query("UPDATE reservations SET status='released' WHERE checkout_id=$1 AND status='held'", [checkoutId]);
  };
  const expireTx = async (db: Queryable) => {
    const { rows } = await db.query("SELECT DISTINCT checkout_id FROM reservations WHERE status='held' AND expires_at <= $1", [now()]);
    for (const row of rows) {
      const found = await db.query("SELECT data FROM orders WHERE checkout_id=$1", [row.checkout_id]);
      if (found.rows[0]) {
        const order = parseOrder(found.rows[0].data);
        if (order.status === "pending") {
          order.status = "cancelled";
          order.paymentStatus = "simulated-cancelled";
          order.events!.push({ status: "cancelled", at: new Date(now()).toISOString(), note: "Payment reservation expired" });
          await saveOrderTx(db, order);
        }
      }
      await releaseTx(db, String(row.checkout_id));
    }
  };
  const inventoryTx = async (db: Queryable): Promise<InventoryRow[]> => {
    const { rows } = await db.query(`SELECT i.product_id, i.title, i.stock,
      COALESCE(SUM(CASE WHEN r.status='held' AND r.expires_at > $1 THEN r.quantity ELSE 0 END),0) AS reserved
      FROM inventory i LEFT JOIN reservations r ON r.product_id=i.product_id
      GROUP BY i.product_id ORDER BY i.title`, [now()]);
    return rows.map(row => ({
      productId: Number(row.product_id), title: String(row.title), stock: Number(row.stock),
      reserved: Number(row.reserved), available: Number(row.stock) - Number(row.reserved),
    }));
  };
  const consumeTx = async (db: Queryable, checkoutId: string) => {
    const { rows } = await db.query("SELECT * FROM reservations WHERE checkout_id=$1 AND status='held' AND expires_at > $2", [checkoutId, now()]);
    if (!rows.length) throw new Error("Stock reservation expired. Return to your basket to reserve the items again.");
    for (const row of rows) {
      const changed = await db.query("UPDATE inventory SET stock=stock-$1 WHERE product_id=$2 AND stock >= $1", [row.quantity, row.product_id]);
      if (!changed.rowCount) throw new Error("Insufficient local stock.");
    }
    await db.query("UPDATE reservations SET status='consumed' WHERE checkout_id=$1 AND status='held'", [checkoutId]);
  };
  const lockInventory = (db: Queryable) => db.query("SELECT pg_advisory_xact_lock(73910421)");

  return {
    async read(id: string) { await ready; return readTx(pool, id); },
    async seedInventory(products: CheckoutProduct[]) {
      return transaction(async db => {
        for (const product of products) {
          if (!Number.isSafeInteger(product.stock) || product.stock < 0) throw new Error("Invalid stock seed.");
          await db.query("INSERT INTO inventory (product_id, title, stock) VALUES ($1, $2, $3) ON CONFLICT(product_id) DO NOTHING", [product.id, product.title, product.stock]);
        }
      });
    },
    async inventory() { return transaction(async db => { await expireTx(db); return inventoryTx(db); }); },
    async updateInventoryStock(productId: number, stock: number, expectedStock: number) {
      return transaction(async db => {
        await lockInventory(db); await expireTx(db);
        if (!Number.isSafeInteger(productId) || productId <= 0) throw new Error("Invalid product.");
        if (!Number.isSafeInteger(stock) || stock < 0 || stock > 9999) throw new Error("Stock must be a whole number between 0 and 9,999.");
        if (!Number.isSafeInteger(expectedStock) || expectedStock < 0) throw new Error("Invalid previous stock value.");
        const items = await inventoryTx(db);
        const item = items.find(row => row.productId === productId);
        if (!item) throw new Error("Inventory item not found.");
        if (item.stock !== expectedStock) throw new Error("Stock changed since this page loaded. Refresh and try again.");
        if (stock < item.reserved) throw new Error(`Stock cannot be lower than the ${item.reserved} units currently reserved.`);
        await db.query("UPDATE inventory SET stock=$1 WHERE product_id=$2", [stock, productId]);
        return (await inventoryTx(db)).find(row => row.productId === productId)!;
      });
    },
    async localProducts(products: CheckoutProduct[], checkoutId = "") {
      return transaction(async db => {
        await expireTx(db);
        const stock = await inventoryTx(db);
        const { rows: own } = await db.query("SELECT product_id, quantity FROM reservations WHERE checkout_id=$1 AND status='held' AND expires_at>$2", [checkoutId, now()]);
        return products.map(product => ({ ...product, stock: (stock.find(row => row.productId === product.id)?.available ?? 0) + Number(own.find(row => Number(row.product_id) === product.id)?.quantity ?? 0) }));
      });
    },
    async createCheckout(sessionId: string, draft: CheckoutDraft) {
      return transaction(async db => {
        await lockInventory(db); await expireTx(db);
        await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [sessionId]);
        await db.query("UPDATE reservations SET status='released' WHERE session_id=$1 AND status='held' AND checkout_id NOT IN (SELECT checkout_id FROM orders)", [sessionId]);
        const shop = await readTx(db, sessionId);
        const signature = (lines: { productId: number; variantId: string; quantity: number }[]) => JSON.stringify(lines.map(line => [line.productId, line.variantId, line.quantity]).sort());
        if (signature(shop.lines) !== signature(draft.quote.lines) || shop.delivery !== draft.quote.deliveryMethod) throw new Error("Basket changed. Please review it again.");
        if (draft.expiresAt <= now() || !shop.lines.length) throw new Error("Checkout expired or basket empty.");
        const quantities = new Map<number, number>();
        for (const line of draft.quote.lines) quantities.set(line.productId, (quantities.get(line.productId) ?? 0) + line.quantity);
        const stock = await inventoryTx(db);
        for (const [id, quantity] of quantities) {
          if ((stock.find(row => row.productId === id)?.available ?? 0) < quantity) throw new Error("Insufficient local stock. Please adjust your basket.");
          await db.query("INSERT INTO reservations (checkout_id, session_id, product_id, quantity, expires_at, status) VALUES ($1,$2,$3,$4,$5,'held')", [draft.id, sessionId, id, quantity, draft.expiresAt]);
        }
        await db.query("INSERT INTO checkout_drafts (id, session_id, data) VALUES ($1,$2,$3::jsonb)", [draft.id, sessionId, JSON.stringify(draft)]);
      });
    },
    async getCheckout(sessionId: string, id: string): Promise<CheckoutDraft | null> {
      return transaction(async db => {
        await expireTx(db);
        const row = await db.query("SELECT data FROM checkout_drafts WHERE id=$1 AND session_id=$2", [id, sessionId]);
        const held = await db.query("SELECT 1 FROM reservations WHERE checkout_id=$1 AND session_id=$2 AND status='held' AND expires_at>$3 LIMIT 1", [id, sessionId, now()]);
        return row.rows[0] && held.rows[0] ? parseJson<CheckoutDraft>(row.rows[0].data) : null;
      });
    },
    async releaseCheckout(sessionId: string, id: string) {
      return transaction(async db => { if (!await orderForCheckoutTx(db, sessionId, id)) await db.query("UPDATE reservations SET status='released' WHERE session_id=$1 AND checkout_id=$2 AND status='held'", [sessionId, id]); });
    },
    async orderForCheckout(sessionId: string, checkoutId: string) { return transaction(async db => { await expireTx(db); return orderForCheckoutTx(db, sessionId, checkoutId); }); },
    async getOrder(sessionId: string, id: string): Promise<Order | null> {
      return transaction(async db => { await expireTx(db); const { rows } = await db.query("SELECT data FROM orders WHERE id=$1 AND session_id=$2", [id, sessionId]); return rows[0] ? parseOrder(rows[0].data) : null; });
    },
    async listOrders(sessionId?: string): Promise<Order[]> {
      return transaction(async db => { await expireTx(db); const { rows } = sessionId === undefined
        ? await db.query("SELECT data FROM orders ORDER BY created_at DESC LIMIT 200")
        : await db.query("SELECT data FROM orders WHERE session_id=$1 ORDER BY created_at DESC LIMIT 200", [sessionId]); return rows.map(row => parseOrder(row.data)); });
    },
    async placeOrder(sessionId: string, checkoutId: string, create: (shop: StoredShop) => Order): Promise<Order> {
      return transaction(async db => {
        await lockInventory(db); await expireTx(db);
        await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [sessionId]);
        const existing = await orderForCheckoutTx(db, sessionId, checkoutId);
        if (existing) return existing;
        const shop = await readTx(db, sessionId);
        const order = create(shop);
        const { rows: held } = await db.query("SELECT * FROM reservations WHERE checkout_id=$1 AND session_id=$2 AND status='held' AND expires_at>$3", [checkoutId, sessionId, now()]);
        const quantities = new Map<number, number>();
        for (const line of order.quote.lines) quantities.set(line.productId, (quantities.get(line.productId) ?? 0) + line.quantity);
        if (held.length !== quantities.size || held.some(row => quantities.get(Number(row.product_id)) !== Number(row.quantity))) throw new Error("Reservation expired or released. Return to your basket to reserve the items again.");
        order.status = order.paymentStatus === "simulated-pending" ? "pending" : "paid";
        order.events = [{ status: "pending", at: order.createdAt, note: "Demo order submitted" }];
        order.inventoryCommitted = order.status === "paid";
        if (order.status === "paid") { await consumeTx(db, checkoutId); order.events.push({ status: "paid", at: order.createdAt, note: "Simulated payment approved" }); }
        await db.query("INSERT INTO orders (id, session_id, checkout_id, data) VALUES ($1,$2,$3,$4::jsonb)", [order.id, sessionId, checkoutId, JSON.stringify(order)]);
        shop.lines = []; await saveShopTx(db, sessionId, shop);
        return order;
      });
    },
    async transitionOrder(id: string, target: OrderStatus, expected: OrderStatus, sessionId?: string): Promise<Order> {
      return transaction(async db => {
        await lockInventory(db); await expireTx(db);
        const result = sessionId === undefined
          ? await db.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE", [id])
          : await db.query("SELECT * FROM orders WHERE id=$1 AND session_id=$2 FOR UPDATE", [id, sessionId]);
        const row = result.rows[0];
        if (!row) throw new Error("Order not found.");
        const order = parseOrder(row.data);
        if (order.status === target) return order;
        if (order.status !== expected) throw new Error("Order changed. Refresh before updating it.");
        if (!(orderTransitions[order.status!] as readonly string[]).includes(target)) throw new Error("This order transition is not allowed.");
        if (sessionId !== undefined && target !== "cancelled") throw new Error("Only cancellation is available to shoppers.");
        if (target === "paid") { await consumeTx(db, String(row.checkout_id)); order.inventoryCommitted = true; order.paymentStatus = "simulated-paid"; }
        if (target === "cancelled") {
          await releaseTx(db, String(row.checkout_id));
          if (order.inventoryCommitted) {
            for (const line of order.quote.lines) await db.query("UPDATE inventory SET stock=stock+$1 WHERE product_id=$2", [line.quantity, line.productId]);
            order.inventoryCommitted = false;
          }
          order.paymentStatus = order.paymentStatus === "simulated-paid" ? "simulated-refunded" : "simulated-cancelled";
        }
        order.status = target;
        order.events!.push({ status: target, at: new Date(now()).toISOString(), note: sessionId === undefined ? "Updated by administrator" : "Cancelled by shopper" });
        await saveOrderTx(db, order); return order;
      });
    },
    async update(id: string, mutate: (shop: StoredShop) => void): Promise<StoredShop> {
      return transaction(async db => {
        await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [id]);
        const shop = await readTx(db, id); mutate(shop); await saveShopTx(db, id, shop); return shop;
      });
    },
    close: () => pool.end(),
  };
}
