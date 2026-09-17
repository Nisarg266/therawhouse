/**
 * THE RAW HOUSE — Universal Smart Sticky Header (Mobile + Desktop)
 * - Scroll down: Header smoothly slides out of view to maximize viewing area.
 * - Scroll up: Header immediately slides back down into view smoothly so user can access navigation anywhere.
 * - Top of page (y <= 70): Always visible in standard position.
 * - Hover / Open drawer / cart / search: Always visible.
 */
(function () {
  var group = document.getElementById('header-group');
  if (!group) return;

  var lastScrollY = 0;
  var isHidden = false;
  var ticking = false;
  var scrollThreshold = 8;

  function getScrollY() {
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
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
      if (group.matches(':hover')) return true;
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

    // Keep visible while menu, cart, or search is open, or when cursor is over header
    if (isInteracting()) {
      setHidden(false);
      lastScrollY = getScrollY();
      return;
    }

    var currentY = getScrollY();
    var delta = currentY - lastScrollY;

    // Always keep visible when near the top of the page
    if (currentY <= 70) {
      setHidden(false);
      lastScrollY = currentY;
      return;
    }

    // Scrolling down: Hide header smoothly
    if (delta > scrollThreshold) {
      setHidden(true);
    }
    // Scrolling up: Reveal header immediately and smoothly
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

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('scroll', onScroll, { passive: true });

  // Initial position check
  lastScrollY = getScrollY();
})();
