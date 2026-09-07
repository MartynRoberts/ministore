import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { emptyShop, type StoredShop } from "./basket";
import type { CheckoutDraft, Order } from "./checkout";

export function openShopStore(filename: string) {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
  db.exec("CREATE TABLE IF NOT EXISTS shop_sessions (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL)");
  db.exec("CREATE TABLE IF NOT EXISTS checkout_drafts (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, data TEXT NOT NULL)");
  db.exec("CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, checkout_id TEXT NOT NULL UNIQUE, data TEXT NOT NULL)");
  const orderForCheckout = (sessionId: string, checkoutId: string): Order | null => {
    const row = db.prepare("SELECT data FROM orders WHERE session_id = ? AND checkout_id = ?").get(sessionId, checkoutId);
    return row ? JSON.parse(String(row.data)) as Order : null;
  };
  const read = (id: string): StoredShop => {
    const row = db.prepare("SELECT data FROM shop_sessions WHERE id = ?").get(id);
    return row ? JSON.parse(String(row.data)) as StoredShop : emptyShop();
  };
  return {
    read,
    createCheckout(sessionId: string, draft: CheckoutDraft) {
      db.prepare("INSERT INTO checkout_drafts VALUES (?, ?, ?)").run(draft.id, sessionId, JSON.stringify(draft));
    },
    getCheckout(sessionId: string, id: string): CheckoutDraft | null {
      const row = db.prepare("SELECT data FROM checkout_drafts WHERE id = ? AND session_id = ?").get(id, sessionId);
      return row ? JSON.parse(String(row.data)) as CheckoutDraft : null;
    },
    orderForCheckout,
    getOrder(sessionId: string, id: string): Order | null {
      const row = db.prepare("SELECT data FROM orders WHERE id = ? AND session_id = ?").get(id, sessionId);
      return row ? JSON.parse(String(row.data)) as Order : null;
    },
    placeOrder(sessionId: string, checkoutId: string, create: (shop: StoredShop) => Order): Order {
      db.exec("BEGIN IMMEDIATE");
      try {
        const existing = orderForCheckout(sessionId, checkoutId);
        if (existing) { db.exec("COMMIT"); return existing; }
        const shop = read(sessionId);
        const order = create(shop);
        db.prepare("INSERT INTO orders VALUES (?, ?, ?, ?)").run(order.id, sessionId, checkoutId, JSON.stringify(order));
        shop.lines = [];
        db.prepare("UPDATE shop_sessions SET data = ?, updated_at = ? WHERE id = ?").run(JSON.stringify(shop), Date.now(), sessionId);
        db.exec("COMMIT");
        return order;
      } catch (error) { db.exec("ROLLBACK"); throw error; }
    },
    update(id: string, mutate: (shop: StoredShop) => void): StoredShop {
      db.exec("BEGIN IMMEDIATE");
      try {
        const shop = read(id);
        mutate(shop);
        db.prepare("INSERT INTO shop_sessions (id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at").run(id, JSON.stringify(shop), Date.now());
        db.exec("COMMIT");
        return shop;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    close: () => db.close(),
  };
}
let store: ReturnType<typeof openShopStore> | undefined;
export function getShopStore() {
  return store ??= openShopStore(resolve(/* turbopackIgnore: true */ process.env.MINISTORE_DB_PATH ?? ".data/ministore.sqlite"));
}
