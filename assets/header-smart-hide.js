/**
 * THE RAW HOUSE — Smart Sticky Header (Phone / Mobile only: <= 989px)
 * - Scroll down: Header smoothly slides out of view to maximize reading area.
 * - Scroll up: Header immediately slides back down into view so user can access navigation anywhere.
 * - Top of page (y <= 70): Always visible in standard position.
 * - Open drawer/cart: Always visible.
 * - Desktop (>= 990px): Completely untouched.
 */
(function () {
  var group = document.getElementById('header-group');
  if (!group) return;

  var mq = window.matchMedia('(max-width: 989px)');
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
    return false;
  }

  function setHidden(hide) {
    if (hide === isHidden) return;
    isHidden = hide;
    group.classList.toggle('header--auto-hidden', isHidden);
  }

  function update() {
    ticking = false;

    // Desktop check: Never hide on desktop
    if (!mq.matches) {
      setHidden(false);
      lastScrollY = getScrollY();
      return;
    }

    // Keep visible while menu or cart drawer is open
    if (isDrawerOpen()) {
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

    // Scrolling down: Hide header
    if (delta > scrollThreshold) {
      setHidden(true);
    }
    // Scrolling up: Reveal header immediately
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

  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', function () {
      if (!mq.matches) {
        setHidden(false);
      }
    });
  }

  // Initial position check
  lastScrollY = getScrollY();
})();
