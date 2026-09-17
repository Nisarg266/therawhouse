import { Component } from '@theme/component';
import { removeWillChangeOnAnimationEnd } from '@theme/utilities';

/**
 * A custom element that manages the main menu drawer.
 *
 * @typedef {object} Refs
 * @property {HTMLDetailsElement} details - The details element.
 * @property {HTMLDivElement} menuDrawer - The slideable drawer panel containing the menu.
 *
 * @extends {Component<Refs>}
 */
class HeaderDrawer extends Component {
  requiredRefs = ['details', 'menuDrawer'];
  #closingTimer = null;

  connectedCallback() {
    super.connectedCallback();

    const details = this.querySelector('details') || this.refs?.details;
    const summary = this.querySelector('summary');
    const backdrop = this.querySelector('.menu-drawer__backdrop');
    const closeButtons = this.querySelectorAll('.menu-drawer__close-button');
    const menuLinks = this.querySelectorAll('.menu-drawer__menu-item, .menu-drawer__editorial-link');

    this.addEventListener('keyup', this.#onKeyUp);
    this.#setupAnimatedElementListeners();

    if (!details || !summary) return;

    // Direct click/tap on summary to toggle
    summary.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.toggle();
    });

    // Keyboard support on summary (Enter / Space)
    summary.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        this.toggle();
      }
    });

    // Backdrop click handler: close drawer
    if (backdrop) {
      backdrop.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      });
    }

    // Close buttons click handler: close drawer
    closeButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      });
    });

    // Auto-close on link navigation
    menuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          this.close();
        }
      });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keyup', this.#onKeyUp);
    if (this.#closingTimer) {
      clearTimeout(this.#closingTimer);
    }
    document.documentElement.classList.remove('menu-drawer-open');
    document.body.classList.remove('menu-drawer-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  /**
   * Close the main menu drawer when the Escape key is pressed
   * @param {KeyboardEvent} event
   */
  #onKeyUp = (event) => {
    if (event.key !== 'Escape') return;
    this.close();
  };

  /**
   * @returns {boolean} Whether the main menu drawer is open
   */
  get isOpen() {
    const details = this.querySelector('details') || this.refs?.details;
    return details ? details.hasAttribute('open') : false;
  }

  /**
   * Toggle the main menu drawer
   */
  toggle() {
    const details = this.querySelector('details') || this.refs?.details;
    if (this.isOpen && details && !details.classList.contains('is-closing')) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the drawer with smooth animation
   */
  open() {
    const details = this.querySelector('details') || this.refs?.details;
    const summary = this.querySelector('summary');
    if (!details) return;

    if (this.#closingTimer) {
      clearTimeout(this.#closingTimer);
      this.#closingTimer = null;
    }

    details.classList.remove('is-closing');
    details.setAttribute('open', '');
    if (summary) {
      summary.setAttribute('aria-expanded', 'true');
    }

    // Force layout flush so animation triggers smoothly
    void details.offsetWidth;

    requestAnimationFrame(() => {
      details.classList.add('menu-open', 'is-open');
      document.documentElement.classList.add('menu-drawer-open');
      document.body.classList.add('menu-drawer-open');
      document.body.style.overflow = 'hidden';

      // Accessibility: focus close button or drawer header
      const closeBtn = this.querySelector('.menu-drawer__close-button');
      if (closeBtn) {
        closeBtn.focus();
      }
    });
  }

  /**
   * Close the drawer with smooth slide-out transition
   */
  close() {
    const details = this.querySelector('details') || this.refs?.details;
    const summary = this.querySelector('summary');
    if (!details || !details.hasAttribute('open')) return;

    if (this.#closingTimer) {
      clearTimeout(this.#closingTimer);
    }

    if (summary) {
      summary.setAttribute('aria-expanded', 'false');
    }
    details.classList.remove('menu-open', 'is-open');
    details.classList.add('is-closing');

    document.documentElement.classList.remove('menu-drawer-open');
    document.body.classList.remove('menu-drawer-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    this.#closingTimer = setTimeout(() => {
      if (details.classList.contains('is-closing')) {
        details.removeAttribute('open');
        details.classList.remove('is-closing');
        if (summary) {
          summary.focus();
        }
      }
      this.#closingTimer = null;
    }, 320);
  }

  /**
   * Back in sub-accordions
   * @param {Event} [event]
   */
  back(event) {
    if (event?.target instanceof Element) {
      const parentDetails = event.target.closest('details');
      const rootDetails = this.querySelector('details') || this.refs?.details;
      if (parentDetails && parentDetails !== rootDetails) {
        parentDetails.removeAttribute('open');
      }
    }
  }

  #setupAnimatedElementListeners() {
    const allAnimated = this.querySelectorAll('.menu-drawer__animated-element');
    allAnimated.forEach((element) => {
      element.addEventListener('animationend', removeWillChangeOnAnimationEnd);
    });
  }
}

if (!customElements.get('header-drawer')) {
  customElements.define('header-drawer', HeaderDrawer);
}
