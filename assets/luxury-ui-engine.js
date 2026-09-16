/**
 * THE RAW HOUSE - LUXURY UI & ANIMATION ENGINE JS
 * Handles scroll reveals, interactive sliders, tab switching,
 * hotspot tooltips, live counters, wishlist, and AJAX Quick Add.
 */

(function () {
  'use strict';

  const initialized = new WeakMap();
  const cleanups = new Map();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let globalEventsInitialized = false;

  function initializeOnce(element, feature) {
    const features = initialized.get(element) || new Set();
    if (features.has(feature)) return false;
    features.add(feature);
    initialized.set(element, features);
    return true;
  }

  function registerCleanup(element, callback) {
    const callbacks = cleanups.get(element) || [];
    callbacks.push(callback);
    cleanups.set(element, callbacks);
  }

  // 1. SCROLL REVEAL OBSERVER
  function initScrollReveals() {
    const revealElements = document.querySelectorAll(
      '.lux-reveal-fade-up, .lux-reveal-zoom, .lux-stagger-parent, .lux-section-heading-wrap'
    );

    // Reveal elements immediately so images are never blocked
    revealElements.forEach((el) => {
      el.classList.add('is-revealed');
    });

  }

  // 2. HERO SHOWCASE SLIDER
  function initHeroSliders() {
    const heroSections = document.querySelectorAll('.lux-hero');

    heroSections.forEach((hero) => {
      if (!initializeOnce(hero, 'hero')) return;
      const slides = hero.querySelectorAll('.lux-hero__slide');
      const dots = hero.querySelectorAll('.lux-hero__dot');
      const prevBtn = hero.querySelector('.lux-hero__arrow-btn--prev');
      const nextBtn = hero.querySelector('.lux-hero__arrow-btn--next');

      if (!slides.length) return;

      let currentIndex = 0;
      let autoplayTimer = null;
      const autoplaySpeed = parseInt(hero.dataset.autoplaySpeed || '6000', 10);
      const isAutoplay = hero.dataset.autoplay === 'true';
      registerCleanup(hero, () => clearInterval(autoplayTimer));

      function goToSlide(index) {
        slides[currentIndex].classList.remove('is-active');
        slides[currentIndex].inert = true;
        slides[currentIndex].setAttribute('aria-hidden', 'true');
        if (dots[currentIndex]) dots[currentIndex].classList.remove('is-active');

        currentIndex = (index + slides.length) % slides.length;

        slides[currentIndex].classList.add('is-active');
        slides[currentIndex].inert = false;
        slides[currentIndex].setAttribute('aria-hidden', 'false');
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
        clearInterval(autoplayTimer);
        if (!isAutoplay || reducedMotion.matches || slides.length < 2) return;
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

      slides.forEach((slide, index) => {
        slide.inert = index !== currentIndex;
        slide.setAttribute('aria-hidden', String(index !== currentIndex));
      });
      resetAutoplay();
    });
  }

  // 3. TABBED PRODUCTS SWITCHER
  function initTabbedProducts() {
    document.querySelectorAll('.lux-tabbed-section').forEach((section) => {
      if (!initializeOnce(section, 'tabs')) return;
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
    document.addEventListener('click', async (event) => {
      const btn = event.target.closest('.lux-quick-add-btn');
      if (!btn) return;
      event.preventDefault();
      if (btn.disabled || btn.classList.contains('is-loading')) return;
      const variantId = btn.dataset.variantId;
      if (!variantId) return;

      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add('is-loading');
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = 'Adding...';
      let deferred;
      let cartAdded = false;
      try {
        const { CartLinesUpdateEvent } = await import('@shopify/events');
        const root = window.Shopify?.routes?.root || '/';
        const sectionIds = [...new Set([...document.querySelectorAll('cart-items-component')]
          .map((element) => element.dataset.sectionId).filter(Boolean))].slice(0, 5);
        deferred = CartLinesUpdateEvent.createPromise();
        deferred.promise.catch(() => {});
        btn.dispatchEvent(new CartLinesUpdateEvent({
          action: 'add',
          context: 'product',
          lines: [{ merchandiseId: variantId, quantity: 1 }],
          promise: deferred.promise,
        }));
        const response = await fetch(root + 'cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            id: variantId, quantity: 1,
            sections: sectionIds.join(','), sections_url: window.location.pathname,
          }),
        });
        const data = await response.json();
        if (!response.ok || data.status) {
          throw new Error(data.description || data.message || 'Unable to add this item.');
        }
        cartAdded = true;
        const cartResponse = await fetch(root + 'cart.js', { headers: { Accept: 'application/json' } });
        if (!cartResponse.ok) throw new Error('Unable to refresh your cart.');
        const cart = await cartResponse.json();
        deferred.resolve({
          cart: CartLinesUpdateEvent.createCartFromAjaxResponse(cart),
          detail: { items: cart.items, sections: data.sections, source: 'luxury-quick-add', didError: false },
        });
        btn.textContent = 'Added ✓';
      } catch (error) {
        deferred?.reject(error);
        if (cartAdded) {
          window.location.assign((window.Shopify?.routes?.root || '/') + 'cart');
          return;
        }
        btn.textContent = error.message || 'Unable to add this item.';
      } finally {
        btn.removeAttribute('aria-busy');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('is-loading');
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  // 5. WISHLIST TOGGLE (LocalStorage)
  function initWishlist() {
    const WISHLIST_KEY = 'therawhouse_wishlist';

    function getWishlist() {
      try {
        const list = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
        return Array.isArray(list) ? list : [];
      } catch (e) {
        return [];
      }
    }

    function saveWishlist(list) {
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
      } catch {
        return;
      }
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
      if (!initializeOnce(btn, 'wishlist')) return;
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
  function closeHotspots() {
    document.querySelectorAll('.lux-hotspot-pin.is-active').forEach((pin) => {
      pin.classList.remove('is-active');
      pin.querySelector('button').setAttribute('aria-expanded', 'false');
    });
  }

  function initRoomHotspots() {
    document.querySelectorAll('.lux-hotspot-pin').forEach((pin) => {
      if (!initializeOnce(pin, 'hotspot')) return;
      const trigger = pin.querySelector('.lux-hotspot-trigger');
      const card = pin.querySelector('.lux-hotspot-card');
      const stage = pin.closest('.lux-hotspots-stage');
      if (!trigger || !card || !stage) return;
      trigger.addEventListener('click', () => {
        const wasActive = pin.classList.contains('is-active');
        closeHotspots();
        if (wasActive) return;
        pin.classList.add('is-active');
        trigger.setAttribute('aria-expanded', 'true');
        card.style.maxWidth = (stage.clientWidth - 16) + 'px';
        card.style.right = 'auto';
        card.style.bottom = 'auto';
        const bounds = stage.getBoundingClientRect();
        const origin = pin.getBoundingClientRect();
        const x = Math.max(bounds.left + 8, Math.min(origin.left, bounds.right - card.offsetWidth - 8));
        const y = Math.max(bounds.top + 8, Math.min(origin.bottom + 12, bounds.bottom - card.offsetHeight - 8));
        card.style.left = (x - origin.left - pin.clientLeft) + 'px';
        card.style.top = (y - origin.top - pin.clientTop) + 'px';
      });
      pin.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeHotspots();
          trigger.focus();
        }
      });
    });
    if (globalEventsInitialized) return;
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.lux-hotspot-pin')) closeHotspots();
    });
    window.addEventListener('resize', closeHotspots);
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
      if (!initializeOnce(counter, 'counter')) return;
      if (reducedMotion.matches) {
        counter.textContent = (counter.dataset.prefix || '') + counter.dataset.target + (counter.dataset.suffix || '');
        return;
      }
      registerCleanup(counter, () => counterObserver.unobserve(counter));
      counterObserver.observe(counter);
    });
  }

  // 8. LUXURY REVIEWS SLIDER CAROUSEL
  function initReviewsSlider() {
    const reviewSections = document.querySelectorAll('.lux-reviews-section');

    reviewSections.forEach((section) => {
      if (!initializeOnce(section, 'reviews')) return;
      const carousel = section.querySelector('.lux-reviews-carousel-outer');
      if (!carousel) return;

      const viewport = carousel.querySelector('.lux-reviews-viewport');
      const track = carousel.querySelector('.lux-reviews-track');
      const slides = carousel.querySelectorAll('.lux-review-slide');
      const prevBtn = carousel.querySelector('.lux-reviews-nav-btn--prev');
      const nextBtn = carousel.querySelector('.lux-reviews-nav-btn--next');
      const dots = section.querySelectorAll('.lux-reviews-dot');

      if (!slides.length || !viewport || !track) return;

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
        clearInterval(autoplayTimer);
        if (!isAutoplay || reducedMotion.matches || getMaxIndex() === 0) return;
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
      registerCleanup(section, () => {
        clearInterval(autoplayTimer);
        window.removeEventListener('resize', updateSliderPosition);
      });

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

  // Shared mobile editorial carousels also initialize after theme-editor reloads.
  function initEditorialCarousels() {
    document.querySelectorAll('[data-editorial-track]').forEach((track) => {
      if (!initializeOnce(track, 'editorial')) return;
      const section = track.closest('.shopify-section');
      const cards = [...track.querySelectorAll('[data-editorial-card]')];
      const dots = [...section.querySelectorAll('[data-editorial-dot]')];
      if (!cards.length || !dots.length) return;
      const targetLeft = (card) => {
        const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        const left = card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft - padding;
        return Math.max(0, Math.min(left, track.scrollWidth - track.clientWidth));
      };
      function update() {
        let active = 0;
        let distance = Infinity;
        cards.forEach((card, index) => {
          const diff = Math.abs(targetLeft(card) - track.scrollLeft);
          if (diff < distance) { active = index; distance = diff; }
        });
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll > 0 && track.scrollLeft >= maxScroll - 1) active = cards.length - 1;
        dots.forEach((dot, index) => {
          dot.classList.toggle('is-active', index === active);
          dot.setAttribute('aria-current', String(index === active));
        });
      }
      dots.forEach((dot, index) => dot.addEventListener('click', () => {
        if (cards[index]) track.scrollTo({ left: targetLeft(cards[index]), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      }));
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      registerCleanup(track, () => window.removeEventListener('resize', update));
      update();
    });
  }

  // INITIALIZE ALL SYSTEMS
  function initAll() {
    initScrollReveals();
    initHeroSliders();
    initTabbedProducts();
    if (!globalEventsInitialized) initQuickAdd();
    initWishlist();
    initRoomHotspots();
    initNumberCounters();
    initReviewsSlider();
    initEditorialCarousels();
    if (!globalEventsInitialized) initCurationTabKeeper();
    globalEventsInitialized = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Re-init on Shopify theme editor section load
  document.addEventListener('shopify:section:load', initAll);
  document.addEventListener('shopify:section:unload', (event) => {
    for (const [element, callbacks] of cleanups) {
      if (event.target.contains(element)) {
        callbacks.forEach((cleanup) => cleanup());
        cleanups.delete(element);
      }
    }
  });
})();
