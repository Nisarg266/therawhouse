(() => {
  if (customElements.get('city-showcase')) return;

  let activeCityId;
  let tabsFrame;

  const activateCity = (id) => {
    const cities = [...document.querySelectorAll('city-showcase[data-city-name]')];
    const selected = cities.find((city) => city.id === id);
    if (!selected) return;
    activeCityId = id;
    cities.forEach((city) => {
      const active = city === selected;
      city.hidden = !active;
      city.closest('.section-city-showcase')?.toggleAttribute('hidden', !active);
      if (!active) {
        city.pauseFilms?.();
        if (city.dialog?.open) city.dialog.close();
      }
    });
    document.querySelectorAll('[data-city-tab]').forEach((tab) => {
      const active = tab.getAttribute('aria-controls') === id;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    requestAnimationFrame(() => {
      if (!selected.track || selected.hidden) return;
      selected.go(selected.current, 'instant');
      selected.update();
    });
  };

  const updateCityTabs = () => {
    const cities = [...document.querySelectorAll('city-showcase[data-city-name]')];
    const indexes = [...document.querySelectorAll('[data-city-index]')];
    if (!indexes.length) {
      cities.forEach((city) => {
        city.hidden = false;
        city.closest('.section-city-showcase')?.removeAttribute('hidden');
        city.removeAttribute('role');
        city.removeAttribute('tabindex');
        city.setAttribute('aria-labelledby', city.querySelector('.city-showcase__title').id);
      });
      return;
    }
    const focusedCity = document.activeElement?.getAttribute('data-city-tab');
    const selected = cities.find((city) => city.id === activeCityId)
      || cities.find((city) => `#${city.id}` === location.hash)
      || cities[0];
    document.querySelectorAll('[data-city-index]').forEach((nav) => {
      const tabs = nav.querySelector('[data-city-tabs]');
      tabs.replaceChildren(...cities.map((city) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.id = `CityTab-${nav.closest('.city-intro').id}-${city.id}`;
        tab.className = 'city-intro__tab';
        tab.setAttribute('role', 'tab');
        tab.setAttribute('data-city-tab', city.id);
        tab.setAttribute('aria-controls', city.id);
        tab.textContent = city.dataset.cityName;
        city.setAttribute('role', 'tabpanel');
        city.setAttribute('aria-labelledby', tab.id);
        city.tabIndex = 0;
        tab.addEventListener('click', () => activateCity(city.id));
        tab.addEventListener('keydown', (event) => {
          const buttons = [...tabs.querySelectorAll('[data-city-tab]')];
          const index = buttons.indexOf(tab);
          const rtl = getComputedStyle(tabs).direction === 'rtl';
          const directions = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 };
          let next;
          if (event.key in directions) next = (index + directions[event.key] + buttons.length) % buttons.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = buttons.length - 1;
          else return;
          event.preventDefault();
          activateCity(buttons[next].getAttribute('aria-controls'));
          buttons[next].focus({ preventScroll: true });
          buttons[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
        });
        return tab;
      }));
      nav.hidden = cities.length === 0;
    });
    if (selected) activateCity(selected.id);
    if (focusedCity) {
      document.querySelectorAll('[data-city-tab]').forEach((tab) => {
        if (tab.getAttribute('data-city-tab') === focusedCity) tab.focus({ preventScroll: true });
      });
    }
  };

  const scheduleCityTabs = () => {
    cancelAnimationFrame(tabsFrame);
    tabsFrame = requestAnimationFrame(updateCityTabs);
  };

    customElements.define('city-showcase', class extends HTMLElement {
      connectedCallback() {
        if (this.controller) return;
        this.controller = new AbortController();
        const { signal } = this.controller;
        scheduleCityTabs();
        this.track = this.querySelector('[data-city-track]');
        if (!this.track) return;
        this.slides = [...this.querySelectorAll('[data-city-slide]')];
        this.current = 0;
        this.dialog = this.querySelector('[data-city-dialog]');
        this.previous = this.querySelector('[data-city-prev]');
        this.next = this.querySelector('[data-city-next]');
        this.querySelector('[data-city-controls]').hidden = this.slides.length < 2;
        this.previous.addEventListener('click', () => this.go(this.current - 1), { signal });
        this.next.addEventListener('click', () => this.go(this.current + 1), { signal });
        this.track.addEventListener('scroll', () => {
          cancelAnimationFrame(this.frame);
          this.frame = requestAnimationFrame(() => this.update());
        }, { passive: true, signal });
        this.track.addEventListener('keydown', (event) => {
          if (event.target !== this.track) return;
          const directions = { ArrowLeft: -1, ArrowRight: 1 };
          if (event.key in directions) {
            event.preventDefault();
            this.go(this.current + directions[event.key]);
          } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            this.go(event.key === 'Home' ? 0 : this.slides.length - 1);
          }
        }, { signal });
        this.querySelectorAll('[data-city-zoom]').forEach((button) => {
          button.hidden = false;
          button.addEventListener('click', () => {
            const slide = button.closest('[data-city-slide]');
            const image = slide.querySelector('img').cloneNode();
            image.loading = 'eager';
            image.removeAttribute('sizes');
            image.removeAttribute('srcset');
            const caption = slide.querySelector('figcaption').cloneNode(true);
            caption.querySelector('span')?.remove();
            this.dialog.querySelector('[data-city-dialog-image]').replaceChildren(image);
            this.dialog.querySelector('[data-city-dialog-caption]').textContent = caption.textContent.trim();
            this.pauseFilms();
            this.dialog.showModal();
          }, { signal });
        });
        this.querySelector('[data-city-close]').addEventListener('click', () => this.dialog.close(), { signal });
        this.dialog.addEventListener('click', (event) => {
          if (event.target !== this.dialog) return;
          const rect = this.dialog.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.dialog.close();
        }, { signal });
        this.querySelectorAll('video').forEach((video) => {
          video.addEventListener('play', () => {
            document.querySelectorAll('city-showcase video').forEach((other) => {
              if (other !== video) other.pause();
            });
          }, { signal });
        });
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio < 0.35) entry.target.querySelector('video')?.pause();
          });
        }, { root: this.track, threshold: 0.35 });
        this.slides.forEach((slide) => this.observer.observe(slide));
        this.viewportObserver = new IntersectionObserver((entries) => {
          if (!entries[0].isIntersecting) this.pauseFilms();
        });
        this.viewportObserver.observe(this.track);
        this.resizeObserver = new ResizeObserver(() => this.update());
        this.resizeObserver.observe(this.track);
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) this.pauseFilms();
        }, { signal });
        this.update();
      }

      disconnectedCallback() {
        this.controller?.abort();
        this.controller = null;
        this.observer?.disconnect();
        this.viewportObserver?.disconnect();
        this.resizeObserver?.disconnect();
        cancelAnimationFrame(this.frame);
        clearTimeout(this.statusTimer);
        this.pauseFilms();
        if (this.dialog?.open) this.dialog.close();
      }

      pauseFilms() { this.querySelectorAll('video').forEach((video) => video.pause()); }

      go(index, behavior) {
        const target = Math.max(0, Math.min(this.slides.length - 1, index));
        const left = this.slides[target].getBoundingClientRect().left - this.track.getBoundingClientRect().left + this.track.scrollLeft;
        this.pauseFilms();
        this.track.scrollTo({ left, behavior: behavior || (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth') });
      }

      update() {
        if (this.hidden || !this.track.getClientRects().length) return;
        const edge = this.track.getBoundingClientRect().left;
        let distance = Infinity;
        this.slides.forEach((slide, index) => {
          const delta = Math.abs(slide.getBoundingClientRect().left - edge);
          if (delta < distance) { distance = delta; this.current = index; }
        });
        this.previous.disabled = this.current === 0;
        this.next.disabled = this.current === this.slides.length - 1;
        this.querySelector('[data-city-current]').textContent = String(this.current + 1).padStart(2, '0');
        this.querySelector('[data-city-progress]').style.transform = `scaleX(${(this.current + 1) / this.slides.length})`;
        clearTimeout(this.statusTimer);
        this.statusTimer = setTimeout(() => {
          const status = this.querySelector('[data-city-status]');
          status.textContent = status.dataset.statusTemplate.replace('[index]', this.current + 1);
        }, 180);
      }
    });
    document.addEventListener('shopify:section:load', scheduleCityTabs);
    document.addEventListener('shopify:section:unload', scheduleCityTabs);
    document.addEventListener('shopify:section:reorder', scheduleCityTabs);
    document.addEventListener('shopify:section:select', (event) => {
      const gallery = event.target.querySelector('city-showcase');
      if (gallery) activateCity(gallery.id);
    });
    document.addEventListener('shopify:block:select', (event) => {
      const gallery = event.target.closest('city-showcase');
      const slide = event.target.closest('[data-city-slide]');
      if (gallery) activateCity(gallery.id);
      if (gallery?.slides && slide) requestAnimationFrame(() => gallery.go(gallery.slides.indexOf(slide), 'instant'));
    });
  scheduleCityTabs();
})();
