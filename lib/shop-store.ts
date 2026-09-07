import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { emptyShop, type StoredShop } from "./basket";

export function openShopStore(filename: string) {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
  db.exec("CREATE TABLE IF NOT EXISTS shop_sessions (id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL)");
  const read = (id: string): StoredShop => {
    const row = db.prepare("SELECT data FROM shop_sessions WHERE id = ?").get(id);
    return row ? JSON.parse(String(row.data)) as StoredShop : emptyShop();
  };
  return {
    read,
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
