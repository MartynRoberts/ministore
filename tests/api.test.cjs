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
  vm.runInNewContext(code, { exports, require: (id) => imports[id], fetch, AbortSignal, URLSearchParams, console: { error() {} } });
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
  assert.equal(products[0].images[0], raw.images[0]);
  assert.equal(products[0].images.includes(raw.thumbnail), false);
  assert.equal(products[0].description, raw.description);
  assert.equal(new Set(products.map(p => p.id)).size, products.length);
});
test('uses gallery fallback and defaults optional description', () => {
  const product = adapter.normalizeProduct({ ...raw, thumbnail: null, images: ['gallery.jpg'], description: null });
  assert.equal(product.image, 'gallery.jpg');
  assert.equal(product.description, '');
});
test('normalizes rich product detail fields without leaking reviewer email', () => {
  const product = adapter.normalizeProduct({ ...raw, discountPercentage: 10, rating: 4.5, stock: 5, tags: ['beauty'], brand: 'Essence', sku: 'SKU1', weight: 2,
    dimensions: { width: 1, height: 2, depth: 3 }, warrantyInformation: '1 month warranty', shippingInformation: 'Ships tomorrow', availabilityStatus: 'Low Stock',
    reviews: [{ rating: 5, comment: 'Great', date: '2024-01-01', reviewerName: 'Alex', reviewerEmail: 'private@example.com' }], returnPolicy: '30 days', minimumOrderQuantity: 2,
    meta: { barcode: '123', updatedAt: '2024-01-01', qrCode: 'qr.png' } });
  assert.equal(product.rating, 4.5);
  assert.equal(product.dimensions.depth, 3);
  assert.equal(product.reviews[0].reviewerEmail, undefined);
  assert.deepEqual(Array.from(product.tags), ['beauty']);
  assert.equal(product.meta.barcode, '123');
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


const catalogue = load('lib/catalogue-query.ts');
const fixture = [
  { id: 1, title: 'Blue shirt', description: 'Cotton', price: 30, category: 'shirts', image: 'a' },
  { id: 2, title: 'Red shirt', description: 'Cotton', price: 20, category: 'shirts', image: 'b' },
  { id: 3, title: 'Blue shoes', description: 'Leather', price: 20, category: 'shoes', image: 'c' },
  { id: 4, title: 'Jacket', description: 'Blue cotton', price: 50, category: 'jackets', image: 'd' },
];
const query = (params) => catalogue.parseCatalogueQuery(new URLSearchParams(params));
const ids = (result) => Array.from(result.items, product => product.id);
test('search and category are combined before pagination, with contextual facets', () => {
  const result = catalogue.queryCatalogue(fixture, query('q=blue&category=shirts&pageSize=1'));
  assert.deepEqual(ids(result), [1]);
  assert.equal(result.total, 1);
  assert.equal(result.facets.categories.length, 3);
  assert.equal(result.facets.categories.find(f => f.value === 'shirts').count, 1);
});
test('sorting is global and deterministic across pages', () => {
  const result = catalogue.queryCatalogue(fixture, query('sort=low-high&pageSize=2&page=2'));
  assert.deepEqual(ids(result), [1, 4]);
  assert.equal(result.total, 4);
  assert.equal(result.totalPages, 2);
  assert.deepEqual(ids(catalogue.queryCatalogue(fixture, query('sort=high-low'))), [4, 1, 2, 3]);
});
test('invalid pagination is normalized, large sizes are bounded, and empty pages are safe', () => {
  const parsed = query('page=1.5&pageSize=999&sort=invalid');
  assert.equal(parsed.page, 1);
  assert.equal(parsed.pageSize, 48);
  assert.equal(parsed.sort, 'relevance');
  const last = catalogue.queryCatalogue(fixture, query('page=999&pageSize=2'));
  assert.equal(last.page, 2);
  assert.deepEqual(ids(last), [3, 4]);
  const empty = catalogue.queryCatalogue(fixture, query('q=missing&page=10'));
  assert.equal(empty.page, 1);
  assert.equal(empty.totalPages, 0);
  assert.equal(empty.items.length, 0);
});
test('favourites constrain totals and facets before pagination', () => {
  const result = catalogue.queryCatalogue(fixture, query('favs=true'), [2, 3]);
  assert.deepEqual(ids(result), [2, 3]);
  assert.equal(result.total, 2);
  assert.equal(result.facets.categories.length, 2);
  assert.equal(catalogue.queryCatalogue(fixture, query('favs=true')).total, 0);
});
test('search supports existing URLs, multiple terms, and title-first relevance', () => {
  assert.deepEqual(ids(catalogue.queryCatalogue(fixture, query('search=blue%20cotton'))), [1, 4]);
  assert.deepEqual(ids(catalogue.queryCatalogue(fixture, query('q=blue'))), [1, 3, 4]);
  assert.equal(query('q=' + 'a'.repeat(300)).search.length, 200);
});
test('catalogue search includes normalized tags and brands', () => {
  const rich = [
    { ...fixture[0], brand: 'Acme', tags: ['summer', 'lightweight'] },
    { ...fixture[1], brand: 'Other', tags: ['winter'] },
  ];
  assert.deepEqual(ids(catalogue.queryCatalogue(rich, query('search=summer'))), [1]);
  assert.deepEqual(ids(catalogue.queryCatalogue(rich, query('search=acme'))), [1]);
});

const recommendation = load('lib/recommendations.ts');
test('recommendations prioritize shared tags, then category, brand, availability and rating', () => {
  const source = { ...fixture[0], brand: 'Acme', tags: ['summer', 'cotton'], rating: 4, stock: 5 };
  const candidates = [
    { ...fixture[1], category: 'other', tags: ['summer'], rating: 1, stock: 0 },
    { ...fixture[2], category: source.category, brand: source.brand, tags: [], rating: 5, stock: 5 },
    { ...fixture[3], category: source.category, tags: ['cotton'], rating: 3, stock: 5 },
  ];
  assert.deepEqual(Array.from(recommendation.rankRecommendations(source, candidates), product => product.id), [4, 2, 3]);
});
