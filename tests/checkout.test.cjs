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
const storage = load('lib/shop-store.ts', { './basket': basket });
const product = { id: 1, title: 'Shirt', description: '', category: 'mens-shirts', image: 'x', price: 20, stock: 10 };
const customer = { name: 'Demo Shopper', email: 'demo@example.com', address: '1 Example Road', city: 'London', postcode: 'SW1A 1AA' };
function setup() {
  const store = storage.openShopStore(':memory:');
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
test('decline keeps the basket and allows a successful retry', async () => {
  const { store } = setup();
  try {
    const action = actions(store);
    assert.match((await action.placeOrder({}, form('decline'))).error, /declined/);
    assert.equal(store.read('alice').lines.length, 1);
    assert.equal(store.orderForCheckout('alice', 'checkout-1'), null);
    await assert.rejects(action.placeOrder({}, form()), /REDIRECT/);
  } finally { store.close(); }
});
test('price changes, basket changes, stock shortages and feed failure never place orders', async () => {
  for (const scenario of ['price', 'basket', 'stock', 'offline']) {
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
test('a second checkout tab cannot place the already-purchased basket again', async () => {
  const { store, quote } = setup();
  try {
    store.createCheckout('alice', { id: 'checkout-2', quote, fingerprint: checkout.fingerprint(quote), expiresAt: Date.now() + 60000 });
    const action = actions(store);
    await assert.rejects(action.placeOrder({}, form()), /REDIRECT/);
    const second = form(); second.set('checkoutId', 'checkout-2');
    assert.match((await action.placeOrder({}, second)).error, /empty/);
    assert.equal(store.orderForCheckout('alice', 'checkout-2'), null);
  } finally { store.close(); }
});
test('checkout tokens are bound to their session and expire', async () => {
  const { store, quote } = setup();
  try {
    assert.ok((await actions(store, { session: 'bob' }).placeOrder({}, form())).error);
    store.createCheckout('alice', { id: 'expired', quote, fingerprint: checkout.fingerprint(quote), expiresAt: 1 });
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
