/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const snapshot = JSON.parse(fs.readFileSync('data/products.json', 'utf8').replace(/^\uFEFF/, ''));
function load(path, imports = {}, fetch) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { exports, require: (id) => imports[id], fetch, AbortSignal, console: { error() {} } });
  return exports;
}
const adapter = load('lib/products.ts');
const raw = snapshot.products[0];
function api(fetch) {
  return load('lib/api.ts', { '@/data/products.json': snapshot, './products': adapter }, fetch).api;
}
test('normalizes the full snapshot and maps thumbnail to image', () => {
  const products = adapter.normalizeProducts(snapshot);
  assert.equal(products.length, snapshot.total);
  assert.ok(products.length > 30);
  assert.equal(products[0].image, raw.thumbnail);
  assert.equal(products[0].description, raw.description);
  assert.equal(new Set(products.map(p => p.id)).size, products.length);
});
test('uses gallery fallback and defaults optional description', () => {
  const product = adapter.normalizeProduct({ ...raw, thumbnail: null, images: ['gallery.jpg'], description: null });
  assert.equal(product.image, 'gallery.jpg');
  assert.equal(product.description, '');
});
test('rejects malformed products and envelopes', () => {
  for (const value of [null, {}, { ...raw, price: '10' }, { ...raw, id: -1 }, { ...raw, thumbnail: null, images: [] }]) {
    assert.throws(() => adapter.normalizeProduct(value));
  }
  assert.throws(() => adapter.normalizeProducts([]));
});
test('list requests all products and detail uses the same model', async () => {
  const urls = [];
  const client = api(async (url) => {
    urls.push(url);
    return { ok: true, json: async () => url.includes('?') ? snapshot : raw };
  });
  const products = await client.getProducts();
  assert.deepEqual(await client.getProduct(raw.id), products[0]);
  assert.equal(urls[0], 'https://dummyjson.com/products?limit=0');
});
test('404 and invalid IDs return null without substituting another product', async () => {
  let calls = 0;
  const client = api(async () => { calls++; return { status: 404, ok: false }; });
  assert.equal(await client.getProduct(0), null);
  assert.equal(calls, 0);
  assert.equal(await client.getProduct(raw.id), null);
});
test('network, HTTP, JSON and schema failures use the same-provider snapshot', async () => {
  for (const fetch of [
    async () => { throw new Error('offline'); },
    async () => ({ ok: false, status: 503 }),
    async () => ({ ok: true, json: async () => { throw new Error('bad JSON'); } }),
    async () => ({ ok: true, json: async () => ({ unexpected: true }) }),
  ]) {
    const client = api(fetch);
    assert.equal((await client.getProducts()).length, snapshot.products.length);
    assert.equal((await client.getProduct(raw.id)).title, raw.title);
    assert.equal(await client.getProduct(999999), null);
  }
});
