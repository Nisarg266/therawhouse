import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import { RecentlyViewed } from '../assets/recently-viewed-products.js';

const source = await readFile(new URL('../assets/luxury-ui-engine.js', import.meta.url), 'utf8');

async function setup(responses) {
  const listeners = new Map();
  const requests = [];
  const events = [];
  const timers = [];
  const redirects = [];
  class CartLinesUpdateEvent {
    constructor(payload) { Object.assign(this, payload); }
    static createPromise() {
      let resolve, reject;
      const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
      return { promise, resolve, reject };
    }
    static createCartFromAjaxResponse(cart) { return { totalQuantity: cart.item_count }; }
  }
  const context = vm.createContext({
    document: {
      readyState: 'complete',
      querySelectorAll: (selector) => selector === 'cart-items-component' ? [{ dataset: { sectionId: 'cart-drawer-section' } }] : [],
      addEventListener: (name, callback) => listeners.set(name, [...(listeners.get(name) || []), callback]),
    },
    window: {
      matchMedia: () => ({ matches: false }),
      Shopify: { routes: { root: '/en-in/' } },
      location: { pathname: '/en-in/collections/all', assign: (url) => redirects.push(url) },
      addEventListener() {},
    },
    localStorage: { getItem: () => null },
    setTimeout: (callback) => timers.push(callback),
    clearInterval() {},
    fetch: async (url, options) => {
      requests.push({ url, options });
      const response = responses.shift();
      if (response instanceof Error) throw response;
      return { ok: response.ok, json: async () => response.data };
    },
  });
  const module = new vm.SyntheticModule(['CartLinesUpdateEvent'], function () {
    this.setExport('CartLinesUpdateEvent', CartLinesUpdateEvent);
  }, { context });
  await module.link(() => {});
  await module.evaluate();
  new vm.Script(source, { importModuleDynamically: async () => module }).runInContext(context);
  const classes = new Set();
  const button = {
    disabled: false, innerHTML: 'Quick Add', textContent: 'Quick Add', dataset: { variantId: '1234' },
    classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) },
    setAttribute() {}, removeAttribute() {},
    dispatchEvent: (event) => events.push(event),
  };
  const click = () => Promise.all(listeners.get('click').map(callback => callback({
    target: { closest: () => button }, preventDefault() {},
  })));
  return { listeners, requests, events, timers, redirects, button, click };
}

test('section reloads do not duplicate cart handlers; rapid clicks only add once', async () => {
  const env = await setup([
    { ok: true, data: { sections: { 'cart-drawer-section': '<div>Updated cart</div>' } } },
    { ok: true, data: { item_count: 1, items: [{ id: 1234 }] } },
  ]);
  const initialListenerCount = env.listeners.get('click').length;
  env.listeners.get('shopify:section:load')[0]();
  env.listeners.get('shopify:section:load')[0]();
  assert.equal(env.listeners.get('click').length, initialListenerCount);
  await Promise.all([env.click(), env.click()]);
  assert.equal(env.requests.length, 2);
  assert.equal(env.requests[0].url, '/en-in/cart/add.js');
  const body = JSON.parse(env.requests[0].options.body);
  assert.equal(body.quantity, 1);
  assert.equal(body.sections, 'cart-drawer-section');
  assert.equal(body.sections_url, '/en-in/collections/all');
  const result = await env.events[0].promise;
  assert.equal(result.cart.totalQuantity, 1);
  assert.equal(result.detail.sections['cart-drawer-section'], '<div>Updated cart</div>');
  assert.equal(env.button.textContent, 'Added ✓');
  env.timers.at(-1)();
  assert.equal(env.button.disabled, false);
});

test('Shopify rejects a sold-out item without displaying success', async () => {
  const env = await setup([{ ok: false, data: { status: 422, description: 'This item is sold out.' } }]);
  await env.click();
  assert.equal(env.requests.length, 1);
  assert.equal(env.button.textContent, 'This item is sold out.');
  await assert.rejects(env.events[0].promise, /sold out/);
  assert.equal(env.redirects.length, 0);
  env.timers.at(-1)();
  assert.equal(env.button.disabled, false);
});

test('successful add followed by failed cart refresh opens cart without retrying the add', async () => {
  const env = await setup([{ ok: true, data: {} }, new Error('Network unavailable')]);
  await env.click();
  assert.equal(env.requests.length, 2);
  assert.deepEqual(env.redirects, ['/en-in/cart']);
});

test('recently viewed tolerates invalid and unavailable storage', () => {
  for (const value of ['broken JSON', 'null', '{}']) {
    globalThis.localStorage = { getItem: () => value };
    assert.deepEqual(RecentlyViewed.getProducts(), []);
  }
  globalThis.localStorage = { getItem: () => '["123","bad",456]' };
  assert.deepEqual(RecentlyViewed.getProducts(), ['123', '456']);
  globalThis.localStorage = {
    getItem() { throw new Error('Blocked'); },
    setItem() { throw new Error('Blocked'); },
    removeItem() { throw new Error('Blocked'); },
  };
  assert.deepEqual(RecentlyViewed.getProducts(), []);
  assert.doesNotThrow(() => RecentlyViewed.addProduct('123'));
  assert.doesNotThrow(() => RecentlyViewed.clearProducts());
  delete globalThis.localStorage;
});
