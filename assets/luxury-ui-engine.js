/**
 * THE RAW HOUSE - LUXURY UI & ANIMATION ENGINE JS
 * Handles scroll reveals, interactive sliders, tab switching,
 * hotspot tooltips, live counters, wishlist, and AJAX Quick Add.
 */

(function () {
  'use strict';

  // 1. SCROLL REVEAL OBSERVER
  function initScrollReveals() {
    const revealElements = document.querySelectorAll(
      '.lux-reveal-fade-up, .lux-reveal-zoom, .lux-stagger-parent, .lux-section-heading-wrap'
    );

    // Reveal elements immediately so images are never blocked
    revealElements.forEach((el) => {
      el.classList.add('is-revealed');
    });

    if (typeof IntersectionObserver === 'undefined') return;

    const scrollContainer = document.querySelector('.page-wrapper');
    const isDesktopContainer = scrollContainer && window.innerWidth >= 990;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: isDesktopContainer ? scrollContainer : null,
        threshold: 0.04,
        rootMargin: '0px 0px 100px 0px',
      }
    );

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  }

  // 2. HERO SHOWCASE SLIDER
  function initHeroSliders() {
    const heroSections = document.querySelectorAll('.lux-hero');

    heroSections.forEach((hero) => {
      const slides = hero.querySelectorAll('.lux-hero__slide');
      const dots = hero.querySelectorAll('.lux-hero__dot');
      const prevBtn = hero.querySelector('.lux-hero__arrow-btn--prev');
      const nextBtn = hero.querySelector('.lux-hero__arrow-btn--next');

      if (!slides.length) return;

      let currentIndex = 0;
      let autoplayTimer = null;
      const autoplaySpeed = parseInt(hero.dataset.autoplaySpeed || '6000', 10);
      const isAutoplay = hero.dataset.autoplay === 'true';

      function goToSlide(index) {
        slides[currentIndex].classList.remove('is-active');
        if (dots[currentIndex]) dots[currentIndex].classList.remove('is-active');

        currentIndex = (index + slides.length) % slides.length;

        slides[currentIndex].classList.add('is-active');
        if (dots[currentIndex]) dots[currentIndex].classList.add('is-active');

        resetAutoplay();
      }

      function nextSlide() {
        goToSlide(currentIndex + 1);
      }

      function prevSlide() {
        goToSlide(currentIndex - 1);
      }

      function resetAutoplay() {
        if (!isAutoplay) return;
        clearInterval(autoplayTimer);
        autoplayTimer = setInterval(nextSlide, autoplaySpeed);
      }

      if (prevBtn) prevBtn.addEventListener('click', prevSlide);
      if (nextBtn) nextBtn.addEventListener('click', nextSlide);

      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => goToSlide(idx));
      });

      // Touch swipe support
      let touchStartX = 0;
      let touchEndX = 0;

      hero.addEventListener(
        'touchstart',
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );

      hero.addEventListener(
        'touchend',
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 45) {
            if (diff > 0) nextSlide();
            else prevSlide();
          }
        },
        { passive: true }
      );

      resetAutoplay();
    });
  }

  // 3. TABBED PRODUCTS SWITCHER
  function initTabbedProducts() {
    document.querySelectorAll('.lux-tabbed-section').forEach((section) => {
      const tabBtns = section.querySelectorAll('.lux-tab-btn');
      const tabPanes = section.querySelectorAll('.lux-tab-pane');

      tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetTab = btn.dataset.tab;

          tabBtns.forEach((b) => b.classList.remove('is-active'));
          tabPanes.forEach((p) => p.classList.remove('is-active'));

          btn.classList.add('is-active');
          const activePane = section.querySelector(`.lux-tab-pane[data-tab="${targetTab}"]`);
          if (activePane) {
            activePane.classList.add('is-active');
          }
        });
      });
    });
  }

  // 4. AJAX QUICK ADD TO CART
  function initQuickAdd() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.lux-quick-add-btn');
      if (!btn) return;

      e.preventDefault();
      const variantId = btn.dataset.variantId;
      if (!variantId) return;

      btn.classList.add('is-loading');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span>Adding...</span>`;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      })
        .then((res) => res.json())
        .then((data) => {
          btn.innerHTML = `<span>Added ✓</span>`;
          btn.style.background = '#28a745';

          // Update cart drawer or cart icon count
          fetch('/cart.js')
            .then((r) => r.json())
            .then((cart) => {
              const cartBadges = document.querySelectorAll('.cart-count-badge, .cart-button__bubble');
              cartBadges.forEach((b) => {
                b.textContent = cart.item_count;
                b.classList.remove('hidden');
              });

              // Dispatch global cart event for Shopify theme cart drawer
              document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
              document.dispatchEvent(new CustomEvent('cart-update', { detail: { cart } }));

              // Try opening cart drawer if available
              const cartDrawer = document.querySelector('cart-drawer, #cart-drawer, theme-drawer[id="cart-drawer"]');
              if (cartDrawer && typeof cartDrawer.open === 'function') {
                cartDrawer.open();
              } else if (cartDrawer && cartDrawer.show) {
                cartDrawer.show();
              } else {
                const drawerToggle = document.querySelector('.cart-button, [aria-controls="cart-drawer"]');
                if (drawerToggle) drawerToggle.click();
              }
            });

          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.classList.remove('is-loading');
          }, 2000);
        })
        .catch((err) => {
          console.error('Error adding to cart:', err);
          btn.innerHTML = `<span>Error</span>`;
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('is-loading');
          }, 2000);
        });
    });
  }

  // 5. WISHLIST TOGGLE (LocalStorage)
  function initWishlist() {
    const WISHLIST_KEY = 'therawhouse_wishlist';

    function getWishlist() {
      try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
      } catch (e) {
        return [];
      }
    }

    function saveWishlist(list) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
      updateWishlistBadges(list.length);
    }

    function updateWishlistBadges(count) {
      document.querySelectorAll('.wishlist-count-badge').forEach((badge) => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
      });
    }

    // Sync state on load
    const saved = getWishlist();
    updateWishlistBadges(saved.length);

    document.querySelectorAll('.lux-product-wishlist-btn').forEach((btn) => {
      const handle = btn.dataset.productHandle;
      if (handle && saved.includes(handle)) {
        btn.classList.add('is-active');
      }

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        let list = getWishlist();
        if (list.includes(handle)) {
          list = list.filter((item) => item !== handle);
          btn.classList.remove('is-active');
        } else {
          list.push(handle);
          btn.classList.add('is-active');
        }
        saveWishlist(list);
      });
    });
  }

  // 6. ROOM HOTSPOTS INTERACTION
  function initRoomHotspots() {
    document.querySelectorAll('.lux-hotspot-pin').forEach((pin) => {
      pin.addEventListener('click', function (e) {
        e.stopPropagation();
        const isActive = this.classList.contains('is-active');
        document.querySelectorAll('.lux-hotspot-pin').forEach((p) => p.classList.remove('is-active'));
        if (!isActive) {
          this.classList.add('is-active');
        }
      });
    });

    document.addEventListener('click', function () {
      document.querySelectorAll('.lux-hotspot-pin').forEach((p) => p.classList.remove('is-active'));
    });
  }

  // 7. ANIMATED NUMBER COUNTERS
  function initNumberCounters() {
    if (typeof IntersectionObserver === 'undefined') return;

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const targetVal = parseInt(counter.dataset.target || '0', 10);
            const prefix = counter.dataset.prefix || '';
            const suffix = counter.dataset.suffix || '';
            const duration = 1800; // ms
            const startTime = performance.now();

            function updateCount(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out quad
              const easeOut = 1 - (1 - progress) * (1 - progress);
              const currentVal = Math.floor(easeOut * targetVal);

              counter.textContent = `${prefix}${currentVal}${suffix}`;

              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                counter.textContent = `${prefix}${targetVal}${suffix}`;
              }
            }

            requestAnimationFrame(updateCount);
            counterObserver.unobserve(counter);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.lux-counter-number[data-target]').forEach((counter) => {
      counterObserver.observe(counter);
    });
  }

  // 8. LUXURY REVIEWS SLIDER CAROUSEL
  function initReviewsSlider() {
    const reviewSections = document.querySelectorAll('.lux-reviews-section');

    reviewSections.forEach((section) => {
      const carousel = section.querySelector('.lux-reviews-carousel-outer');
      if (!carousel) return;

      const viewport = carousel.querySelector('.lux-reviews-viewport');
      const track = carousel.querySelector('.lux-reviews-track');
      const slides = carousel.querySelectorAll('.lux-review-slide');
      const prevBtn = carousel.querySelector('.lux-reviews-nav-btn--prev');
      const nextBtn = carousel.querySelector('.lux-reviews-nav-btn--next');
      const dots = section.querySelectorAll('.lux-reviews-dot');

      if (!slides.length) return;

      let currentIndex = 0;
      let autoplayTimer = null;
      const isAutoplay = section.dataset.autoplay === 'true';
      const autoplaySpeed = parseInt(section.dataset.autoplaySpeed || '5000', 10);

      function getVisibleSlidesCount() {
        if (window.innerWidth <= 640) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
      }

      function getMaxIndex() {
        const visible = getVisibleSlidesCount();
        return Math.max(0, slides.length - visible);
      }

      function updateSliderPosition() {
        const maxIdx = getMaxIndex();
        if (currentIndex > maxIdx) currentIndex = maxIdx;
        if (currentIndex < 0) currentIndex = 0;

        const visible = getVisibleSlidesCount();
        const slideWidthPercent = 100 / visible;
        const translateX = -(currentIndex * slideWidthPercent);

        track.style.transform = `translateX(${translateX}%)`;

        // Update dots
        dots.forEach((dot, idx) => {
          dot.classList.toggle('is-active', idx === currentIndex);
        });

        // Update arrow states
        if (prevBtn) {
          prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
        }
        if (nextBtn) {
          nextBtn.style.opacity = currentIndex >= maxIdx ? '0.4' : '1';
        }
      }

      function nextSlide() {
        const maxIdx = getMaxIndex();
        if (currentIndex >= maxIdx) {
          currentIndex = 0;
        } else {
          currentIndex++;
        }
        updateSliderPosition();
        resetAutoplay();
      }

      function prevSlide() {
        const maxIdx = getMaxIndex();
        if (currentIndex <= 0) {
          currentIndex = maxIdx;
        } else {
          currentIndex--;
        }
        updateSliderPosition();
        resetAutoplay();
      }

      function resetAutoplay() {
        if (!isAutoplay) return;
        clearInterval(autoplayTimer);
        autoplayTimer = setInterval(nextSlide, autoplaySpeed);
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          prevSlide();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          nextSlide();
        });
      }

      dots.forEach((dot) => {
        dot.addEventListener('click', function () {
          currentIndex = parseInt(this.dataset.index || '0', 10);
          updateSliderPosition();
          resetAutoplay();
        });
      });

      // Touch & Mouse Dragging
      let isDragging = false;
      let startX = 0;

      function touchStart(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        viewport.classList.add('is-dragging');
        clearInterval(autoplayTimer);
      }

      function touchMove(e) {
        if (!isDragging) return;
        const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const diff = currentX - startX;
        if (Math.abs(diff) > 40) {
          isDragging = false;
          viewport.classList.remove('is-dragging');
          if (diff < 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
      }

      function touchEnd() {
        isDragging = false;
        viewport.classList.remove('is-dragging');
        resetAutoplay();
      }

      viewport.addEventListener('touchstart', touchStart, { passive: true });
      viewport.addEventListener('touchmove', touchMove, { passive: true });
      viewport.addEventListener('touchend', touchEnd);

      viewport.addEventListener('mousedown', touchStart);
      viewport.addEventListener('mousemove', touchMove);
      viewport.addEventListener('mouseup', touchEnd);
      viewport.addEventListener('mouseleave', touchEnd);

      window.addEventListener('resize', updateSliderPosition);

      updateSliderPosition();
      resetAutoplay();
    });
  }

  // 9. KEEP CURATION TAB ALWAYS OPEN ("Keep curation tab open")
  function initCurationTabKeeper() {
    function keepOpen() {
      const detailsList = document.querySelectorAll(
        '.product-details details, .accordion details'
      );
      detailsList.forEach((details, idx) => {
        const header = details.querySelector('summary');
        const text = header ? header.textContent.toLowerCase() : '';
        if (text.includes('curation') || details.classList.contains('is-curation-tab') || idx === 0) {
          if (!details.open) {
            details.open = true;
            details.setAttribute('open', '');
            details.setAttribute('declarative-open', '');
          }
        }
      });
    }

    keepOpen();
    setTimeout(keepOpen, 100);
    setTimeout(keepOpen, 500);
    setTimeout(keepOpen, 1500);

    window.addEventListener('load', keepOpen);
  }

  // INITIALIZE ALL SYSTEMS
  function initAll() {
    initScrollReveals();
    initHeroSliders();
    initTabbedProducts();
    initQuickAdd();
    initWishlist();
    initRoomHotspots();
    initNumberCounters();
    initReviewsSlider();
    initCurationTabKeeper();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Re-init on Shopify theme editor section load
  document.addEventListener('shopify:section:load', initAll);
  document.addEventListener('shopify:section:select', initAll);
})();
