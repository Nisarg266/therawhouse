(() => {
  const main = document.getElementById('MainContent');
  if (!main || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const targets = 'h2, [data-art-reveal], .brand-manifesto__text, .art-button, .art-link';
  const excluded = 'product-card, .product-card, .product-details, .product-information, product-form-component, .cart-page, .cart-form, cart-items-component, dialog, sticky-add-to-cart, [data-art-motion="off"]';
  const seen = new WeakSet();
  const pending = new Set();
  const active = new Map();

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      observer.unobserve(element);
      pending.delete(element);
      seen.add(element);
      if (preference.matches || element.matches(':focus-within')) continue;

      const isAction = element.matches('.art-button, .art-link');
      const frames = isAction
        ? [{ opacity: 0.45 }, { opacity: 1 }]
        : [
            { opacity: 0.4, filter: 'blur(4px)', translate: '0 12px' },
            { opacity: 1, filter: 'blur(0)', translate: '0 0' },
          ];
      const animation = element.animate(frames, {
        duration: isAction ? 420 : 700,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
      active.set(element, animation);
      animation.finished.then(() => active.delete(element)).catch(() => active.delete(element));
    }
  }, { threshold: 0.08 });

  function register(root) {
    if (preference.matches || !(root instanceof Element)) return;
    const elements = [...root.querySelectorAll(targets)];
    if (root.matches(targets)) elements.unshift(root);
    for (const element of elements) {
      if (seen.has(element) || pending.has(element) || element.closest(excluded)) continue;
      if (element.closest('.art-button, .art-link') !== null && !element.matches('.art-button, .art-link')) continue;
      const bounds = element.getBoundingClientRect();
      if (bounds.height && bounds.top < window.innerHeight && bounds.bottom > 0) {
        seen.add(element);
        continue;
      }
      pending.add(element);
      observer.observe(element);
    }
  }

  function clearMotion() {
    observer.disconnect();
    pending.clear();
    for (const animation of active.values()) animation.cancel();
    active.clear();
  }

  const mutations = new MutationObserver((records) => {
    for (const element of pending) {
      if (!element.isConnected) {
        observer.unobserve(element);
        pending.delete(element);
      }
    }
    for (const record of records) {
      for (const node of record.addedNodes) register(node);
    }
  });

  main.addEventListener('focusin', (event) => {
    for (const element of pending) {
      if (element.contains(event.target)) {
        observer.unobserve(element);
        pending.delete(element);
        seen.add(element);
      }
    }
    for (const [element, animation] of active) {
      if (element.contains(event.target)) animation.cancel();
    }
  });
  preference.addEventListener('change', () => {
    clearMotion();
    register(main);
  });
  document.addEventListener('shopify:section:load', (event) => {
    if (main.contains(event.target)) register(event.target);
  });
  document.addEventListener('shopify:section:select', clearMotion);
  document.addEventListener('shopify:block:select', clearMotion);
  window.addEventListener('pagehide', () => {
    clearMotion();
    mutations.disconnect();
  });
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    register(main);
    mutations.observe(main, { childList: true, subtree: true });
  });
  register(main);
  mutations.observe(main, { childList: true, subtree: true });
})();
