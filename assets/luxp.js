(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var controllers = new WeakMap();

  function createScope(root) {
    var cleanups = [];
    controllers.set(root, function () {
      cleanups.forEach(function (cleanup) { cleanup(); });
      controllers.delete(root);
    });
    return {
      addCleanup: function (cleanup) { cleanups.push(cleanup); },
      listen: function (target, type, listener, options) {
        target.addEventListener(type, listener, options);
        cleanups.push(function () { target.removeEventListener(type, listener, options); });
      }
    };
  }

  /* ---------------- Hero slider ---------------- */
  function initHero(root) {
    if (controllers.has(root)) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-luxp-slide]'));
    if (slides.length === 0) return;

    var scope = createScope(root);
    var listen = scope.listen;
    var track = root.querySelector('.luxp-hero__track');
    var dotsWrap = root.querySelector('[data-luxp-dots]');
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
    var prevBtn = root.querySelector('[data-luxp-prev]');
    var nextBtn = root.querySelector('[data-luxp-next]');
    var autoplay = root.getAttribute('data-luxp-autoplay') === 'true';
    var speed = parseInt(root.getAttribute('data-luxp-speed') || '6', 10) * 1000;
    var index = 0;
    var timer = null;
    var naturalHeight = root.classList.contains('luxp-hero--natural');

    function syncNaturalHeight() {
      if (!naturalHeight || !track) return;
      var activeSlide = slides[index];
      if (!activeSlide) return;
      var height = activeSlide.offsetHeight;
      if (height > 0) {
        track.style.height = height + 'px';
      }
    }

    function goTo(i, animate) {
      if (typeof animate === 'undefined') animate = true;
      index = (i + slides.length) % slides.length;
      root.setAttribute('data-header-tone', slides[index].getAttribute('data-header-tone') || 'light');

      if (track) {
        track.style.transition = animate && !reducedMotion.matches ? 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
        track.style.transform = 'translate3d(' + (-index * 100) + '%, 0, 0)';
      }

      slides.forEach(function (slide, n) {
        var active = n === index;
        slide.classList.toggle('luxp-hero__slide--active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        if (active) {
          slide.removeAttribute('inert');
        } else {
          slide.setAttribute('inert', '');
        }
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle('luxp-hero__dot--active', n === index);
        dot.setAttribute('aria-current', n === index ? 'true' : 'false');
      });

      syncNaturalHeight();
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (!autoplay || slides.length < 2 || reducedMotion.matches) return;
      timer = setInterval(function () {
        goTo(index + 1);
      }, speed);
    }

    scope.addCleanup(function () {
      stop();
      root.removeAttribute('data-luxp-ready');
      root.classList.remove('is-dragging');
    });

    if (prevBtn) listen(prevBtn, 'click', function () { stop(); goTo(index - 1); start(); });
    if (nextBtn) listen(nextBtn, 'click', function () { stop(); goTo(index + 1); start(); });
    dots.forEach(function (dot, n) {
      listen(dot, 'click', function () { stop(); goTo(n); start(); });
    });

    listen(root, 'mouseenter', stop);
    listen(root, 'mouseleave', start);
    listen(root, 'focusin', stop);
    listen(root, 'focusout', start);

    listen(root, 'keydown', function (event) {
      if (event.key === 'ArrowLeft') { stop(); goTo(index - 1); start(); }
      if (event.key === 'ArrowRight') { stop(); goTo(index + 1); start(); }
    });

    /* Touch & Swipe gesture handling for mobile devices with real-time drag */
    var touchStartX = 0;
    var touchStartY = 0;
    var touchCurrentX = 0;
    var touchCurrentY = 0;
    var isSwiping = false;
    var didSwipe = false;

    function onTouchStart(clientX, clientY, target) {
      if (target && target.closest && target.closest('[data-luxp-prev], [data-luxp-next], [data-luxp-dots]')) return;
      stop();
      touchStartX = clientX;
      touchStartY = clientY;
      touchCurrentX = clientX;
      touchCurrentY = clientY;
      isSwiping = true;
      didSwipe = false;
      if (track) {
        track.style.transition = 'none';
      }
    }

    function onTouchMove(clientX, clientY, e) {
      if (!isSwiping) return;
      touchCurrentX = clientX;
      touchCurrentY = clientY;

      var diffX = touchCurrentX - touchStartX;
      var diffY = touchCurrentY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        didSwipe = true;
        root.classList.add('is-dragging');
        if (e && e.cancelable) {
          e.preventDefault();
        }
        if (track) {
          var trackWidth = root.offsetWidth || window.innerWidth;
          var movePx = -index * trackWidth + diffX;
          track.style.transform = 'translate3d(' + movePx + 'px, 0, 0)';
        }
      }
    }

    function onTouchEnd() {
      if (!isSwiping) return;
      isSwiping = false;
      root.classList.remove('is-dragging');

      var diffX = touchCurrentX - touchStartX;
      var diffY = touchCurrentY - touchStartY;

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        didSwipe = true;
        stop();
        if (diffX < 0) {
          goTo(index + 1); // Swiped left -> Next slide
        } else {
          goTo(index - 1); // Swiped right -> Previous slide
        }
      } else {
        goTo(index); // Snap back smoothly to current slide
      }
      start();
    }

    listen(root, 'touchstart', function (e) {
      if (!e.touches || e.touches.length !== 1) return;
      onTouchStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
    }, { passive: true });

    listen(root, 'touchmove', function (e) {
      if (!e.touches || e.touches.length !== 1) return;
      onTouchMove(e.touches[0].clientX, e.touches[0].clientY, e);
    }, { passive: false });

    listen(root, 'touchend', onTouchEnd, { passive: true });
    listen(root, 'touchcancel', function () {
      isSwiping = false;
      root.classList.remove('is-dragging');
      goTo(index);
      start();
    }, { passive: true });

    // Mouse drag support for desktop & trackpad
    var isMouseDown = false;
    listen(root, 'mousedown', function (e) {
      if (e.button !== 0) return;
      if (e.target && e.target.closest && e.target.closest('[data-luxp-prev], [data-luxp-next], [data-luxp-dots]')) return;
      isMouseDown = true;
      onTouchStart(e.clientX, e.clientY, e.target);
    });

    listen(window, 'mousemove', function (e) {
      if (!isMouseDown) return;
      onTouchMove(e.clientX, e.clientY, e);
    });

    listen(window, 'mouseup', function () {
      if (!isMouseDown) return;
      isMouseDown = false;
      onTouchEnd();
    });

    // Prevent link click if the touch/drag was a slide swipe gesture
    listen(root, 'click', function (e) {
      if (didSwipe) {
        e.preventDefault();
        e.stopPropagation();
        didSwipe = false;
      }
    }, true);

    function onMotionChange() {
      if (!reducedMotion.matches) return;
      stop();
      if (track) track.style.transition = 'none';
    }

    if (typeof reducedMotion.addEventListener === 'function') {
      listen(reducedMotion, 'change', onMotionChange);
    } else {
      reducedMotion.addListener(onMotionChange);
      scope.addCleanup(function () { reducedMotion.removeListener(onMotionChange); });
    }

    if (naturalHeight) {
      slides.forEach(function (slide) {
        var images = Array.prototype.slice.call(slide.querySelectorAll('img'));
        images.forEach(function (image) {
          if (image.complete) return;
          listen(image, 'load', syncNaturalHeight, { once: true });
        });
      });
      listen(window, 'resize', syncNaturalHeight);
    }

    goTo(0, false);
    start();
    root.setAttribute('data-luxp-ready', 'true');
  }

  /* ---------------- View more / less ---------------- */
  function initToggle(root) {
    if (controllers.has(root)) return;
    var btn = root.querySelector('[data-luxp-toggle]');
    if (!btn) return;

    var scope = createScope(root);
    scope.listen(btn, 'click', function (e) {
      if (e) e.preventDefault();
      var expanded = root.getAttribute('data-luxp-expanded') === 'true';
      if (expanded) {
        root.setAttribute('data-luxp-expanded', 'false');
        btn.textContent = btn.getAttribute('data-luxp-more') || 'VIEW MORE';
        btn.setAttribute('aria-expanded', 'false');
        var rect = root.getBoundingClientRect();
        if (rect.top < -50) {
          root.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
        }
      } else {
        root.setAttribute('data-luxp-expanded', 'true');
        btn.textContent = btn.getAttribute('data-luxp-less') || 'VIEW LESS';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function forEachRoot(node, selector, callback) {
    if (node.matches && node.matches(selector)) callback(node);
    node.querySelectorAll(selector).forEach(callback);
  }

  function init(node) {
    forEachRoot(node, '[data-luxp-hero]', initHero);
    forEachRoot(node, '[data-luxp-collapsible]', initToggle);
  }

  function unload(node) {
    forEachRoot(node, '[data-luxp-hero], [data-luxp-collapsible]', function (root) {
      var cleanup = controllers.get(root);
      if (cleanup) cleanup();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); }, { once: true });
  } else {
    init(document);
  }

  document.addEventListener('shopify:section:load', function (event) { init(event.target); });
  document.addEventListener('shopify:section:unload', function (event) { unload(event.target); });
})();
