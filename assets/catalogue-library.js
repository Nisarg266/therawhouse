if (!customElements.get('catalogue-library')) {
  customElements.define('catalogue-library', class extends HTMLElement {
    connectedCallback() {
      if (this.controller) return;
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      this.cards = [...this.querySelectorAll('.catalogue-card')];
      this.search = this.querySelector('input[type="search"]');
      this.filters = [...this.querySelectorAll('[data-filter]')];
      this.results = this.querySelector('.catalogue-results');
      this.empty = this.querySelector('.catalogue-empty');
      this.more = this.querySelector('.catalogue-more');
      this.batchSize = Number(this.dataset.initialCount) || 9;
      this.visibleLimit = this.batchSize;
      this.category = 'all';
      this.querySelector('.catalogue-tools').hidden = false;
      this.search.addEventListener('input', () => {
        this.visibleLimit = this.batchSize;
        this.update();
      }, options);
      this.filters.forEach(button => button.addEventListener('click', () => {
        this.category = button.dataset.filter;
        this.visibleLimit = this.batchSize;
        this.update();
      }, options));
      this.querySelector('[data-reset]').addEventListener('click', () => {
        this.search.value = '';
        this.category = 'all';
        this.visibleLimit = this.batchSize;
        this.update();
        this.search.focus({ preventScroll: true });
      }, options);
      this.querySelector('[data-load-more]').addEventListener('click', () => {
        const previousLimit = this.visibleLimit;
        this.visibleLimit += this.batchSize;
        const matches = this.update();
        const next = matches[previousLimit]?.querySelector('.catalogue-card__cover[href]');
        next?.focus({ preventScroll: true });
        next?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      }, options);
      this.addEventListener('click', event => {
        const link = event.target.closest('[data-catalogue-download]');
        if (!link || !this.contains(link) || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        this.download(link);
      }, options);
      this.addEventListener('shopify:block:select', event => {
        const card = event.target.closest('.catalogue-card');
        if (!card) return;
        this.search.value = '';
        this.category = 'all';
        this.visibleLimit = this.cards.length;
        this.update();
      }, options);
      this.update();
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.controller = null;
    }

    normalize(value) {
      return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
    }

    update() {
      const words = this.normalize(this.search.value.trim()).split(/\s+/).filter(Boolean);
      const matches = this.cards.filter(card => {
        const text = this.normalize(card.dataset.search || '');
        return (this.category === 'all' || card.dataset.category === this.category) && words.every(word => text.includes(word));
      });
      const shown = new Set(matches.slice(0, this.visibleLimit));
      this.cards.forEach(card => { card.hidden = !shown.has(card); });
      this.filters.forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.filter === this.category));
      });
      this.results.textContent = (this.dataset.resultsPattern || '[shown] of [total]')
        .replaceAll('[shown]', String(shown.size)).replaceAll('[total]', String(matches.length));
      this.empty.hidden = matches.length !== 0;
      this.more.hidden = matches.length <= this.visibleLimit;
      return matches;
    }

    async download(link) {
      if (link.getAttribute('aria-busy') === 'true') return;
      const label = link.querySelector('[data-download-label]');
      const originalLabel = label.textContent;
      const feedback = link.closest('.catalogue-card').querySelector('.catalogue-card__feedback');
      feedback.hidden = true;
      label.textContent = this.dataset.downloadingLabel;
      link.setAttribute('aria-busy', 'true');
      let blobUrl;
      try {
        const response = await fetch(link.href, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: this.controller.signal });
        if (!response.ok) throw new Error('Catalogue download failed');
        const blob = await response.blob();
        if (!(await blob.slice(0, 5).text()).startsWith('%PDF')) throw new Error('Not a PDF file');
        blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = link.download;
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
      } catch (error) {
        if (error.name !== 'AbortError') {
          feedback.textContent = this.dataset.downloadError;
          feedback.hidden = false;
        }
      } finally {
        label.textContent = originalLabel;
        link.removeAttribute('aria-busy');
        if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      }
    }
  });
}
