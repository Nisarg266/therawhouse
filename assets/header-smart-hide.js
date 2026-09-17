/**
 * THE RAW HOUSE — Universal Smart Sticky Header (Mobile + Desktop)
 * - Scroll down: Header smoothly slides out of view to maximize viewing area.
 * - Scroll up: Header immediately slides back down into view smoothly anywhere on page.
 * - Top of page (y <= 70): Always visible in standard position.
 * - Touch devices: Guarded against stuck :hover states.
 * - Safe against mobile iOS rubber-band bounces and drawer open states.
 */
(function () {
  var group = document.getElementById('header-group');
  if (!group) return;

  var lastScrollY = 0;
  var isHidden = false;
  var ticking = false;
  var scrollThreshold = 6;

  function getScrollY() {
    var pageWrapper = document.querySelector('.page-wrapper');
    var pwTop = pageWrapper ? pageWrapper.scrollTop : 0;
    var winTop = window.scrollY !== undefined ? window.scrollY : (window.pageYOffset || 0);
    var docTop = document.documentElement ? document.documentElement.scrollTop : 0;
    var bodyTop = document.body ? document.body.scrollTop : 0;
    return Math.max(pwTop, winTop, docTop, bodyTop);
  }

  function isDrawerOpen() {
    var drawer = document.getElementById('Details-menu-drawer-container');
    if (drawer && drawer.hasAttribute('open')) return true;
    if (document.body.classList.contains('menu-drawer-open')) return true;
    if (document.body.classList.contains('overflow-hidden')) return true;
    var cartDrawer = document.getElementById('cart-drawer');
    if (cartDrawer && cartDrawer.hasAttribute('open')) return true;
    var searchModal = document.querySelector('search-modal[open], details[id*="search"][open], details[id*="Search"][open]');
    if (searchModal) return true;
    return false;
  }

  function isInteracting() {
    if (isDrawerOpen()) return true;
    try {
      // Touchscreens (phones) should NEVER trigger persistent hover locks
      var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (canHover && group.matches(':hover')) return true;
    } catch (e) {}
    return false;
  }

  function setHidden(hide) {
    if (hide === isHidden) return;
    isHidden = hide;
    group.classList.toggle('header--auto-hidden', isHidden);
  }

  function update() {
    ticking = false;

    // Keep visible while menu, cart, or search is open, or during hover on pointer devices
    if (isInteracting()) {
      setHidden(false);
      lastScrollY = getScrollY();
      return;
    }

    var currentY = getScrollY();

    // Clamp iOS top rubber-band overscroll
    if (currentY < 0) currentY = 0;

    // Always keep visible when near the top of the page
    if (currentY <= 70) {
      setHidden(false);
      lastScrollY = currentY;
      return;
    }

    var delta = currentY - lastScrollY;

    // Scrolling down: Hide header smoothly
    if (delta > scrollThreshold) {
      setHidden(true);
    }
    // Scrolling up: Reveal header immediately and smoothly anywhere on page
    else if (delta < -scrollThreshold) {
      setHidden(false);
    }

    lastScrollY = currentY;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  // Support both mobile window scrolls and desktop page-wrapper scrolls
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('touchmove', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Initial position check
  lastScrollY = getScrollY();
})();
