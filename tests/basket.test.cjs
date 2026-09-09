/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require: id => id in imports ? imports[id] : require(id), process, console });
  return exports;
}
const basket = load('lib/basket.ts');
const storage = load('lib/shop-store.ts', { './basket': basket, './order-status': load('lib/order-status.ts') });
const product = { id: 1, title: 'Shirt', category: 'mens-shirts', description: '', image: 'shirt.jpg', price: 19.99 };
const variants = basket.getVariants(product);

test('sizes persist as distinct basket lines with independent quantities', () => {
  const shop = basket.emptyShop();
  basket.updateLine(shop, product, variants[0].id, 1, true);
  basket.updateLine(shop, product, variants[1].id, 2);
  basket.updateLine(shop, product, variants[0].id, 1, true);
  assert.equal(shop.lines.length, 2);
  assert.equal(shop.lines[0].quantity, 2);
  assert.equal(shop.lines[1].quantity, 2);
  basket.updateLine(shop, product, variants[0].id, 0);
  assert.equal(shop.lines.length, 1);
  assert.equal(shop.lines[0].variantId, variants[1].id);
});
test('invalid quantities and mismatched variants cannot enter a basket', () => {
  for (const quantity of [-1, 0.5, 100, NaN, Infinity]) {
    assert.throws(() => basket.updateLine(basket.emptyShop(), product, variants[0].id, quantity));
  }
  assert.throws(() => basket.updateLine(basket.emptyShop(), product, 'dummyjson-2-s', 1));
  const shop = basket.emptyShop();
  basket.updateLine(shop, product, variants[0].id, 99);
  assert.throws(() => basket.updateLine(shop, product, variants[0].id, 1, true));
  assert.equal(shop.lines[0].quantity, 99);
});
test('quotes use integer money and reprice against server products', () => {
  const shop = basket.emptyShop();
  basket.updateLine(shop, product, variants[0].id, 3);
  const quote = basket.quoteBasket(shop, [product]);
  assert.equal(quote.subtotal, 5997);
  assert.equal(quote.delivery, 350);
  assert.equal(quote.total, 6347);
  assert.equal(quote.currency, 'GBP');
  assert.equal(basket.quoteBasket(shop, [{ ...product, price: 20 }]).subtotal, 6000);
});
test('standard delivery updates automatically at the free-delivery threshold', () => {
  const shop = basket.emptyShop();
  basket.updateLine(shop, { ...product, price: 50 }, variants[0].id, 2);
  assert.equal(basket.quoteBasket(shop, [{ ...product, price: 50 }]).delivery, 0);
  shop.delivery = 'premium';
  assert.equal(basket.quoteBasket(shop, [product]).delivery, 450);
  shop.delivery = 'next-day';
  assert.equal(basket.quoteBasket(shop, [product]).delivery, 500);
  shop.lines = [];
  assert.equal(basket.quoteBasket(shop, []).total, 0);
});
test('unavailable products remain visible and block checkout review', () => {
  const shop = basket.emptyShop();
  basket.updateLine(shop, product, variants[0].id, 1);
  const quote = basket.quoteBasket(shop, []);
  assert.equal(quote.lines.length, 1);
  assert.equal(quote.lines[0].available, false);
  assert.equal(quote.canCheckout, false);
});
test('SQLite persists sessions across reopen, isolates users and rolls back failed changes', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ministore-basket-'));
  const filename = path.join(directory, 'shop.sqlite');
  let store = storage.openShopStore(filename);
  try {
    store.update('alice', shop => basket.updateLine(shop, product, variants[0].id, 1, true));
    store.update('alice', shop => basket.updateLine(shop, product, variants[0].id, 1, true));
    assert.equal(store.read('alice').lines[0].quantity, 2);
    assert.equal(store.read('bob').lines.length, 0);
    assert.throws(() => store.update('alice', shop => { shop.lines = []; throw new Error('rollback'); }));
    assert.equal(store.read('alice').lines[0].quantity, 2);
    store.close();
    store = storage.openShopStore(filename);
    assert.equal(store.read('alice').lines[0].quantity, 2);
  } finally {
    store.close();
    fs.unlinkSync(filename);
    for (const suffix of ['-wal', '-shm']) if (fs.existsSync(filename + suffix)) fs.unlinkSync(filename + suffix);
    fs.rmdirSync(directory);
  }
});
test('server actions issue opaque cookies and calculate authoritative session results', async () => {
  const store = storage.openShopStore(':memory:');
  const jar = new Map();
  const cookieOptions = [];
  const actions = load('app/actions/shop.ts', {
    'next/headers': { cookies: async () => ({ get: name => jar.has(name) ? { value: jar.get(name) } : undefined, set: (name, value, options) => { jar.set(name, value); cookieOptions.push(options); } }) },
    'next/cache': { revalidatePath() {} },
    '@/lib/api': { api: { getProduct: async id => id === 1 ? product : null, getProducts: async () => [product] } },
    '@/lib/shop-store': { getShopStore: () => store },
    '@/lib/basket': basket,
  });
  try {
    assert.equal((await actions.getShopSession()).basket.count, 0);
    assert.equal(jar.size, 0);
    const added = await actions.addToBasket(1, variants[0].id);
    assert.equal(added.basket.total, 2349);
    assert.match(jar.get('ministore_session_v2'), /^[a-f0-9]{64}$/);
    assert.equal(cookieOptions[0].httpOnly, true);
    assert.equal((await actions.setBasketQty(variants[0].id, 2)).basket.count, 2);
    await assert.rejects(actions.setBasketQty(variants[0].id, -1));
    await assert.rejects(actions.addToBasket(2, 'dummyjson-2-standard'));
    await assert.rejects(actions.setDelivery('free-standard'));
    assert.equal((await actions.getShopSession()).basket.count, 2);
    await actions.toggleFav(1);
    assert.equal((await actions.getShopSession()).favs[0], 1);
    await actions.setBasketQty(variants[0].id, 0);
    assert.equal((await actions.getShopSession()).basket.total, 0);
  } finally { store.close(); }
});
