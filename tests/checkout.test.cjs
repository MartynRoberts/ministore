/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, require: id => id in imports ? imports[id] : require(id), process, console, Error, FormData, AbortSignal, ...globals });
  return exports;
}
const basket = load('lib/basket.ts');
const checkout = load('lib/checkout.ts', { './basket': basket });
const storage = load('lib/shop-store.ts', { './basket': basket, './order-status': load('lib/order-status.ts') });
const product = { id: 1, title: 'Shirt', description: '', category: 'mens-shirts', image: 'x', price: 20, stock: 10 };
const customer = { name: 'Demo Shopper', email: 'demo@example.com', address: '1 Example Road', city: 'London', postcode: 'SW1A 1AA' };
function setup() {
  const store = storage.openShopStore(':memory:');
  store.seedInventory([product]);
  const shop = store.update('alice', shop => basket.updateLine(shop, product, 'dummyjson-1-s', 2));
  const quote = checkout.validateCheckout(shop, [product]);
  store.createCheckout('alice', { id: 'checkout-1', fingerprint: checkout.fingerprint(quote), quote, expiresAt: Date.now() + 60000 });
  return { store, shop, quote };
}
function form(payment = 'approve') {
  const form = new FormData();
  for (const [key, value] of Object.entries(customer)) form.set(key, value);
  form.set('checkoutId', 'checkout-1'); form.set('payment', payment);
  return form;
}
function actions(store, options = {}) {
  return load('app/actions/checkout.ts', {
    'next/cache': { revalidatePath() {} },
    'next/navigation': { redirect: path => { throw new Error('REDIRECT:' + path); } },
    './shop': { getCurrentSessionId: async () => options.session ?? 'alice' },
    '@/lib/shop-store': { getShopStore: () => store },
    '@/lib/checkout-api': { getCheckoutProducts: options.feed ?? (async () => [product]) },
    '@/lib/checkout': checkout,
    '@/lib/basket': basket,
  });
}
test('checkout validates combined stock across sizes and rejects empty baskets', () => {
  const shop = basket.emptyShop();
  basket.updateLine(shop, product, 'dummyjson-1-s', 6);
  basket.updateLine(shop, product, 'dummyjson-1-m', 5);
  assert.throws(() => checkout.validateCheckout(shop, [product]), /stock/);
  assert.throws(() => checkout.validateCheckout(basket.emptyShop(), [product]), /empty/);
});
test('delivery details are validated on the server', () => {
  assert.equal(checkout.parseCustomer(form()).email, customer.email);
  const invalid = form(); invalid.set('email', 'invalid');
  assert.throws(() => checkout.parseCustomer(invalid), /email/);
  invalid.set('email', customer.email); invalid.set('postcode', 'invalid');
  assert.throws(() => checkout.parseCustomer(invalid), /postcode/);
});
test('approved checkout atomically saves an order and clears the basket; retries return the same order', async () => {
  const { store } = setup();
  try {
    const action = actions(store);
    await assert.rejects(action.placeOrder({}, form()), /REDIRECT:\/orders\//);
    const order = store.orderForCheckout('alice', 'checkout-1');
    assert.equal(order.paymentStatus, 'simulated-paid');
    assert.equal(order.quote.total, 4350);
    assert.equal(store.read('alice').lines.length, 0);
    await assert.rejects(action.placeOrder({}, form()), error => error.message === 'REDIRECT:/orders/' + order.id);
    assert.equal(store.orderForCheckout('alice', 'checkout-1').id, order.id);
    assert.equal(store.getOrder('bob', order.id), null);
  } finally { store.close(); }
});
test('decline releases stock and a new checkout can succeed', async () => {
  const { store } = setup();
  try {
    const action = actions(store);
    assert.match((await action.placeOrder({}, form('decline'))).error, /declined/);
    assert.equal(store.read('alice').lines.length, 1);
    assert.equal(store.orderForCheckout('alice', 'checkout-1'), null);
    assert.equal(store.inventory()[0].reserved, 0);
    const quote = checkout.validateCheckout(store.read('alice'), [product]);
    store.createCheckout('alice', { id: 'checkout-retry', quote, fingerprint: checkout.fingerprint(quote), expiresAt: Date.now() + 60000 });
    const retry = form(); retry.set('checkoutId', 'checkout-retry');
    await assert.rejects(action.placeOrder({}, retry), /REDIRECT/);
  } finally { store.close(); }
});
test('price changes, basket changes and feed failure never place orders', async () => {
  for (const scenario of ['price', 'basket', 'offline']) {
    const { store } = setup();
    try {
      if (scenario === 'basket') store.update('alice', shop => { shop.lines[0].quantity = 3; });
      const feed = async () => {
        if (scenario === 'offline') throw new Error('offline');
        return [{ ...product, price: scenario === 'price' ? 25 : 20, stock: scenario === 'stock' ? 1 : 10 }];
      };
      assert.ok((await actions(store, { feed }).placeOrder({}, form())).error);
      assert.equal(store.orderForCheckout('alice', 'checkout-1'), null);
      assert.equal(store.read('alice').lines.length, 1);
    } finally { store.close(); }
  }
});
test('a new checkout replaces the old tab reservation', async () => {
  const { store, quote } = setup();
  try {
    store.createCheckout('alice', { id: 'checkout-2', quote, fingerprint: checkout.fingerprint(quote), expiresAt: Date.now() + 60000 });
    const action = actions(store);
    assert.ok((await action.placeOrder({}, form())).error);
    const second = form(); second.set('checkoutId', 'checkout-2');
    await assert.rejects(action.placeOrder({}, second), /REDIRECT/);
    assert.equal(store.inventory()[0].stock, 8);
  } finally { store.close(); }
});
test('checkout tokens are bound to their session and expire', async () => {
  const { store, quote } = setup();
  try {
    assert.ok((await actions(store, { session: 'bob' }).placeOrder({}, form())).error);
    assert.throws(() => store.createCheckout('alice', { id: 'expired', quote, fingerprint: checkout.fingerprint(quote), expiresAt: 1 }));
    const expired = form(); expired.set('checkoutId', 'expired');
    assert.match((await actions(store).placeOrder({}, expired)).error, /expired/);
    assert.equal(store.read('alice').lines.length, 1);
  } finally { store.close(); }
});
test('checkout feed explicitly bypasses cache and never falls back on error', async () => {
  const adapter = load('lib/products.ts');
  const feed = load('lib/checkout-api.ts', { './products': adapter }, { fetch: async (_url, options) => {
    assert.equal(options.cache, 'no-store');
    return { ok: false };
  } });
  await assert.rejects(feed.getCheckoutProducts(), /unavailable/);
});

function reserve(store, session, id, quantity, expiresAt) {
  const shop = store.update(session, shop => { shop.lines = []; basket.updateLine(shop, product, 'dummyjson-1-s', quantity); });
  const quote = basket.quoteBasket(shop, [product]);
  store.createCheckout(session, { id, quote, fingerprint: checkout.fingerprint(quote), expiresAt });
  return quote;
}
function submit(store, session, checkoutId, quote, pending = false) {
  return store.placeOrder(session, checkoutId, () => ({ id: 'order-' + checkoutId, createdAt: new Date().toISOString(), customer, quote, paymentStatus: pending ? 'simulated-pending' : 'simulated-paid' }));
}
test('competing sessions cannot oversell and reseeding never resets sold stock', () => {
  const store = storage.openShopStore(':memory:');
  try {
    store.seedInventory([{ ...product, stock: 3 }]);
    const quote = reserve(store, 'alice', 'a', 2, Date.now() + 60000);
    assert.throws(() => reserve(store, 'bob', 'b', 2, Date.now() + 60000), /stock/);
    assert.equal(store.inventory()[0].available, 1);
    submit(store, 'alice', 'a', quote);
    store.seedInventory([{ ...product, stock: 500 }]);
    assert.equal(store.inventory()[0].stock, 1);
    assert.equal(store.inventory()[0].reserved, 0);
    submit(store, 'alice', 'a', quote);
    assert.equal(store.inventory()[0].stock, 1);
  } finally { store.close(); }
});
test('expired reservations release availability and cancel pending orders', () => {
  let clock = 1000;
  const store = storage.openShopStore(':memory:', () => clock);
  try {
    store.seedInventory([{ ...product, stock: 2 }]);
    const quote = reserve(store, 'alice', 'a', 2, 2000);
    const order = submit(store, 'alice', 'a', quote, true);
    assert.equal(order.status, 'pending');
    assert.equal(store.inventory()[0].available, 0);
    clock = 2001;
    assert.equal(store.inventory()[0].available, 2);
    assert.equal(store.getOrder('alice', order.id).status, 'cancelled');
    assert.throws(() => store.transitionOrder(order.id, 'paid', 'pending'));
    assert.equal(store.inventory()[0].stock, 2);
  } finally { store.close(); }
});
test('pending payment commits stock once and follows only valid fulfilment transitions', () => {
  const store = storage.openShopStore(':memory:');
  try {
    store.seedInventory([product]);
    const quote = reserve(store, 'alice', 'a', 2, Date.now() + 60000);
    const order = submit(store, 'alice', 'a', quote, true);
    assert.equal(store.inventory()[0].stock, 10);
    store.transitionOrder(order.id, 'paid', 'pending');
    store.transitionOrder(order.id, 'paid', 'pending');
    assert.equal(store.inventory()[0].stock, 8);
    assert.throws(() => store.transitionOrder(order.id, 'shipped', 'paid'));
    store.transitionOrder(order.id, 'processing', 'paid');
    store.transitionOrder(order.id, 'shipped', 'processing');
    assert.throws(() => store.transitionOrder(order.id, 'cancelled', 'shipped'));
    assert.equal(store.getOrder('alice', order.id).events.length, 4);
  } finally { store.close(); }
});
test('cancellation restores committed stock exactly once and isolates shopper access', () => {
  const store = storage.openShopStore(':memory:');
  try {
    store.seedInventory([product]);
    const quote = reserve(store, 'alice', 'a', 2, Date.now() + 60000);
    const order = submit(store, 'alice', 'a', quote);
    assert.throws(() => store.transitionOrder(order.id, 'cancelled', 'paid', 'bob'));
    assert.throws(() => store.transitionOrder(order.id, 'processing', 'paid', 'alice'));
    store.transitionOrder(order.id, 'cancelled', 'paid', 'alice');
    store.transitionOrder(order.id, 'cancelled', 'paid', 'alice');
    assert.equal(store.inventory()[0].stock, 10);
    assert.equal(store.getOrder('alice', order.id).paymentStatus, 'simulated-refunded');
    assert.equal(store.listOrders('bob').length, 0);
    assert.equal(store.listOrders('alice').length, 1);
  } finally { store.close(); }
});
test('a failed order transaction preserves the reservation, stock and basket', () => {
  const store = storage.openShopStore(':memory:');
  try {
    store.seedInventory([product]);
    reserve(store, 'alice', 'a', 2, Date.now() + 60000);
    assert.throws(() => store.placeOrder('alice', 'a', () => { throw new Error('failed'); }));
    assert.equal(store.inventory()[0].stock, 10);
    assert.equal(store.inventory()[0].reserved, 2);
    assert.equal(store.read('alice').lines.length, 1);
  } finally { store.close(); }
});
test('stock is coordinated across database connections and survives restart', () => {
  const path = require('node:path'), os = require('node:os');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ministore-inventory-'));
  const filename = path.join(directory, 'shop.sqlite');
  let first = storage.openShopStore(filename), second = storage.openShopStore(filename);
  try {
    first.seedInventory([{ ...product, stock: 2 }]);
    const quote = reserve(first, 'alice', 'a', 2, Date.now() + 60000);
    assert.throws(() => reserve(second, 'bob', 'b', 1, Date.now() + 60000), /stock/);
    submit(first, 'alice', 'a', quote);
    first.close(); first = storage.openShopStore(filename);
    assert.equal(first.inventory()[0].stock, 0);
    assert.equal(first.listOrders('alice').length, 1);
  } finally {
    first.close(); second.close();
    for (const suffix of ['', '-wal', '-shm']) if (fs.existsSync(filename + suffix)) fs.unlinkSync(filename + suffix);
    fs.rmdirSync(directory);
  }
});
test('admin cookies require the configured secret and reject tampering', async () => {
  const processStub = { env: { MINISTORE_ADMIN_PASSWORD: 'test-admin-password-long-enough' } };
  const auth = load('lib/admin-auth.ts', { 'next/headers': { cookies: async () => ({ get: () => undefined }) } }, { process: processStub, Buffer });
  const token = auth.createAdminToken();
  assert.equal(auth.validAdminToken(token), true);
  assert.equal(auth.validAdminToken(token + 'x'), false);
  assert.equal(auth.validAdminToken('1.deadbeef'), false);
  assert.equal(await auth.isAdmin(), false);
  processStub.env.MINISTORE_ADMIN_PASSWORD = 'changed-admin-password-long-enough';
  assert.equal(auth.validAdminToken(token), false);
});
test('the configured demo password meets admin password limits', () => {
  const processStub = { env: { MINISTORE_ADMIN_PASSWORD: 'password' } };
  const auth = load('lib/admin-auth.ts', { 'next/headers': { cookies: async () => ({ get: () => undefined }) } }, { process: processStub, Buffer });
  assert.equal(auth.validAdminPasswordLength('password'), true);
  assert.equal(auth.validAdminPasswordLength('short'), false);
  assert.equal(auth.validAdminPasswordLength('x'.repeat(128)), true);
  assert.equal(auth.validAdminPasswordLength('x'.repeat(129)), false);
  assert.equal(auth.validAdminToken(auth.createAdminToken()), true);
});
test('admin mutation refuses unauthenticated callers', async () => {
  let touched = false;
  const orderActions = load('app/actions/orders.ts', {
    'next/headers': { cookies: async () => ({}) },
    'next/navigation': { redirect() {} },
    'next/cache': { revalidatePath() {} },
    '@/lib/admin-auth': { isAdmin: async () => false },
    '@/lib/shop-store': { getShopStore: () => { touched = true; throw new Error('unexpected'); } },
    './shop': { getCurrentSessionId: async () => null },
    '@/lib/order-status': load('lib/order-status.ts'),
  });
  assert.match((await orderActions.updateOrder({}, new FormData())).error, /sign-in/);
  assert.match((await orderActions.updateInventory({}, new FormData())).error, /sign-in/);
  assert.equal(touched, false);
});

test('admin stock edits create scenarios without invalidating active reservations', () => {
  const store = storage.openShopStore(':memory:');
  try {
    store.seedInventory([{ ...product, stock: 10 }]);
    assert.equal(store.updateInventoryStock(1, 3, 10).available, 3);
    assert.throws(() => store.updateInventoryStock(1, 5, 10), /changed/);
    reserve(store, 'alice', 'stock-scenario', 2, Date.now() + 60000);
    assert.throws(() => store.updateInventoryStock(1, 1, 3), /reserved/);
    assert.equal(store.updateInventoryStock(1, 2, 3).available, 0);
    assert.throws(() => reserve(store, 'bob', 'sold-out', 1, Date.now() + 60000), /stock/);
    assert.throws(() => store.updateInventoryStock(1, -1, 2), /whole number/);
    assert.throws(() => store.updateInventoryStock(1, 10000, 2), /whole number/);
  } finally { store.close(); }
});
