const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');

const source = readFileSync(join(__dirname, '../assets/luxp.js'), 'utf8');

class Target {
  listeners = new Map();
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  dispatch(type, event = {}) {
    for (const listener of this.listeners.get(type) || []) listener({ target: this, ...event });
  }
  count(type) { return this.listeners.get(type)?.size || 0; }
  total() { return Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0); }
}

class Element extends Target {
  attributes = new Map();
  style = {};
  children = [];
  queries = new Map();
  offsetHeight = 400;
  offsetWidth = 1000;
  classes = new Set();
  classList = {
    contains: name => this.classes.has(name),
    add: name => this.classes.add(name),
    remove: name => this.classes.delete(name),
    toggle: (name, active) => active ? this.classes.add(name) : this.classes.delete(name)
  };
  constructor(attributes = {}) {
    super();
    for (const [name, value] of Object.entries(attributes)) this.attributes.set(name, value);
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  matches(selector) {
    return selector.split(',').some(part => this.attributes.has(part.trim().slice(1, -1)));
  }
  closest() { return null; }
  querySelector(selector) { return this.queries.get(selector)?.[0] || null; }
  querySelectorAll(selector) {
    return this.queries.get(selector) || this.children.filter(child => child.matches(selector));
  }
  getBoundingClientRect() { return { top: -100 }; }
  scrollIntoView(options) { this.lastScroll = options; }
}

function hero() {
  const root = new Element({ 'data-luxp-hero': '', 'data-luxp-autoplay': 'true' });
  root.classes.add('luxp-hero--natural');
  const track = new Element();
  const next = new Element();
  const dots = new Element();
  dots.children = Array.from({ length: 3 }, () => new Element());
  const slides = Array.from({ length: 3 }, (_, i) => {
    const slide = new Element({ 'data-luxp-slide': '', 'data-header-tone': i === 1 ? 'dark' : 'light' });
    slide.queries.set('img', [new Element()]);
    return slide;
  });
  root.queries.set('[data-luxp-slide]', slides);
  root.queries.set('.luxp-hero__track', [track]);
  root.queries.set('[data-luxp-next]', [next]);
  root.queries.set('[data-luxp-dots]', [dots]);
  return { root, track, next, dots, slides };
}

function setup({ reduced = false, legacy = false } = {}) {
  const slider = hero();
  const toggle = new Element({ 'data-luxp-collapsible': '', 'data-luxp-expanded': 'false' });
  const button = new Element({ 'data-luxp-more': 'MORE', 'data-luxp-less': 'LESS' });
  toggle.queries.set('[data-luxp-toggle]', [button]);
  const section = new Element();
  section.children = [slider.root, toggle];
  const document = new Element();
  document.children = section.children;
  document.readyState = 'complete';
  const window = new Target();
  const motion = new Target();
  motion.matches = reduced;
  if (legacy) {
    motion.addListener = listener => Target.prototype.addEventListener.call(motion, 'change', listener);
    motion.removeListener = listener => Target.prototype.removeEventListener.call(motion, 'change', listener);
    motion.addEventListener = undefined;
    motion.removeEventListener = undefined;
  }
  window.matchMedia = () => motion;
  const timers = new Map();
  let timerId = 0;
  runInNewContext(source, {
    window, document,
    setInterval: listener => { timers.set(++timerId, listener); return timerId; },
    clearInterval: id => timers.delete(id)
  });
  return { ...slider, toggle, button, section, document, window, motion, timers };
}

test('arrows synchronize the slide, focusability, dots and header tone', () => {
  const env = setup();
  env.next.dispatch('click');
  assert.equal(env.track.style.transform, 'translate3d(-100%, 0, 0)');
  assert.equal(env.root.getAttribute('data-header-tone'), 'dark');
  assert.equal(env.slides[0].getAttribute('inert'), '');
  assert.equal(env.slides[1].getAttribute('inert'), null);
  assert.equal(env.dots.children[1].getAttribute('aria-current'), 'true');
  assert.equal(env.timers.size, 1);
});

test('loading an initialized section does not duplicate controls or timers', () => {
  const env = setup();
  for (let i = 0; i < 5; i++) env.document.dispatch('shopify:section:load', { target: env.section });
  assert.equal(env.timers.size, 1);
  assert.equal(env.window.count('mousemove'), 1);
  assert.equal(env.button.count('click'), 1);
  env.next.dispatch('click');
  assert.equal(env.track.style.transform, 'translate3d(-100%, 0, 0)');
  env.button.dispatch('click', { preventDefault() {} });
  assert.equal(env.toggle.getAttribute('data-luxp-expanded'), 'true');
});

test('unloading releases every section listener and timer across repeated reloads', () => {
  const env = setup();
  for (let i = 0; i < 10; i++) {
    env.document.dispatch('shopify:section:unload', { target: env.section });
    assert.equal(env.timers.size, 0);
    assert.equal(env.window.total(), 0);
    assert.equal(env.motion.total(), 0);
    assert.equal(env.root.total(), 0);
    assert.equal(env.next.total(), 0);
    assert.equal(env.button.total(), 0);
    assert.equal(env.root.getAttribute('data-luxp-ready'), null);
    for (const slide of env.slides) assert.equal(slide.querySelector('img').total(), 0);
    env.document.dispatch('shopify:section:load', { target: env.section });
    assert.equal(env.timers.size, 1);
    assert.equal(env.window.count('resize'), 1);
  }
});

for (const legacy of [false, true]) {
  test(`reduced motion stops autoplay and animated slide changes (${legacy ? 'legacy' : 'modern'} Safari API)`, () => {
    const env = setup({ legacy });
    env.motion.matches = true;
    env.motion.dispatch('change');
    assert.equal(env.timers.size, 0);
    env.next.dispatch('click');
    assert.equal(env.track.style.transition, 'none');
    assert.equal(env.track.style.transform, 'translate3d(-100%, 0, 0)');
    env.document.dispatch('shopify:section:unload', { target: env.section });
    assert.equal(env.motion.total(), 0);
  });
}

test('collapsing a grid respects motion preferences and keeps its button state', () => {
  for (const reduced of [false, true]) {
    const env = setup({ reduced });
    env.button.dispatch('click', { preventDefault() {} });
    assert.equal(env.button.textContent, 'LESS');
    env.button.dispatch('click', { preventDefault() {} });
    assert.equal(env.button.getAttribute('aria-expanded'), 'false');
    assert.equal(env.button.textContent, 'MORE');
    assert.equal(env.toggle.lastScroll.behavior, reduced ? 'instant' : 'smooth');
  }
});

test('dragging advances the hero and suppresses the following link click', () => {
  const env = setup();
  env.root.dispatch('mousedown', { button: 0, clientX: 700, clientY: 200 });
  env.window.dispatch('mousemove', { clientX: 400, clientY: 210, cancelable: true, preventDefault() {} });
  env.window.dispatch('mouseup');
  assert.equal(env.track.style.transform, 'translate3d(-100%, 0, 0)');
  let prevented = false;
  env.root.dispatch('click', { preventDefault() { prevented = true; }, stopPropagation() {} });
  assert.equal(prevented, true);
});
