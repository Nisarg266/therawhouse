(() => {
  const updateCityIndex = () => {
    const cities = [...document.querySelectorAll('city-showcase[data-city-name]')];
    document.querySelectorAll('[data-city-index]').forEach((nav) => {
      const links = nav.querySelector('[data-city-links]');
      links.replaceChildren(...cities.map((city) => {
        const link = document.createElement('a');
        link.href = `#${city.id}`;
        link.textContent = city.dataset.cityName;
        return link;
      }));
      nav.hidden = cities.length === 0;
    });
  };

  if (!customElements.get('city-showcase')) {
    customElements.define('city-showcase', class extends HTMLElement {
      connectedCallback() {
        if (this.controller) return;
        this.controller = new AbortController();
        const { signal } = this.controller;
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
        updateCityIndex();
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

      go(index) {
        const target = Math.max(0, Math.min(this.slides.length - 1, index));
        const left = this.slides[target].getBoundingClientRect().left - this.track.getBoundingClientRect().left + this.track.scrollLeft;
        this.pauseFilms();
        this.track.scrollTo({ left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      }

      update() {
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
    document.addEventListener('shopify:section:load', updateCityIndex);
    document.addEventListener('shopify:section:unload', () => requestAnimationFrame(updateCityIndex));
    document.addEventListener('shopify:section:reorder', updateCityIndex);
    document.addEventListener('shopify:block:select', (event) => {
      const gallery = event.target.closest('city-showcase');
      const slide = event.target.closest('[data-city-slide]');
      if (gallery?.slides && slide) gallery.go(gallery.slides.indexOf(slide));
    });
  }
  updateCityIndex();
})();
