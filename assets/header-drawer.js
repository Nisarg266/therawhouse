import { Component } from '@theme/component';
import { trapFocus, removeTrapFocus } from '@theme/focus';
import { onAnimationEnd, removeWillChangeOnAnimationEnd } from '@theme/utilities';

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

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('keyup', this.#onKeyUp);
    this.#setupAnimatedElementListeners();

    // Explicit click handler on summary to ensure reliable drawer toggling
    const summary = this.querySelector('summary');
    if (summary) {
      summary.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.toggle(event);
      });
    }

    // Backdrop click handler to dismiss the drawer
    const backdrop = this.querySelector('.menu-drawer__backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.close(event);
      });
    }

    // Close button click handler
    const closeButtons = this.querySelectorAll('.menu-drawer__close-button');
    closeButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.close(event);
      });
    });

    // Auto-close on link navigation
    const menuLinks = this.querySelectorAll('.menu-drawer__menu-item');
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
  }

  /**
   * Close the main menu drawer when the Escape key is pressed
   * @param {KeyboardEvent} event
   */
  #onKeyUp = (event) => {
    if (event.key !== 'Escape') return;

    this.#close(this.#getDetailsElement(event));
  };

  /**
   * @returns {boolean} Whether the main menu drawer is open
   */
  get isOpen() {
    return this.refs.details.hasAttribute('open');
  }

  /**
   * Get the closest details element to the event target
   * @param {Event | undefined} event
   * @returns {HTMLDetailsElement}
   */
  #getDetailsElement(event) {
    if (!(event?.target instanceof Element)) return this.refs.details;

    return event.target.closest('details') ?? this.refs.details;
  }

  /**
   * Toggle the main menu drawer
   * @param {Event} [event]
   */
  toggle(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    return this.isOpen ? this.close(event) : this.open(undefined, event);
  }

  /**
   * Open the closest drawer or the main menu drawer
   * @param {string} [target]
   * @param {Event} [event]
   */
  open(target, event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const details = this.#getDetailsElement(event);
    const summary = details.querySelector('summary');

    if (!summary) return;

    details.setAttribute('open', '');
    summary.setAttribute('aria-expanded', 'true');
    details.classList.remove('is-closing');
    details.classList.add('menu-open', 'is-open');

    this.preventInitialAccordionAnimations(details);
    requestAnimationFrame(() => {
      if (target && this.refs.menuDrawer) {
        this.refs.menuDrawer.classList.add('menu-drawer--has-submenu-opened');
      }

      // Wait for the drawer animation to complete before trapping focus
      const drawer = details.querySelector('.menu-drawer, .menu-drawer__submenu');
      onAnimationEnd(drawer || details, () => trapFocus(details), { subtree: false });
    });
  }

  /**
   * Go back or close the main menu drawer
   * @param {Event} [event]
   */
  back(event) {
    this.#close(this.#getDetailsElement(event));
  }

  /**
   * Close the main menu drawer
   * @param {Event} [event]
   */
  close(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    this.#close(this.refs.details);
  }

  /**
   * Close the closest menu or submenu that is open
   *
   * @param {HTMLDetailsElement} details
   */
  #close(details) {
    if (!details) return;
    const summary = details.querySelector('summary');

    if (summary) {
      summary.setAttribute('aria-expanded', 'false');
    }
    details.classList.add('is-closing');
    details.classList.remove('menu-open', 'is-open');
    if (this.refs.menuDrawer) {
      this.refs.menuDrawer.classList.remove('menu-drawer--has-submenu-opened');
    }

    // Wait for the .menu-drawer element's transition, with safety timeout fallback
    const drawer = details.querySelector('.menu-drawer, .menu-drawer__submenu');

    let isDone = false;
    const finishClosing = () => {
      if (isDone) return;
      isDone = true;
      details.classList.remove('is-closing');
      reset(details);
      if (details === this.refs.details) {
        removeTrapFocus();
        const openDetails = this.querySelectorAll('details[open]:not(accordion-custom > details)');
        openDetails.forEach(reset);
      } else if (this.refs.details) {
        trapFocus(this.refs.details);
      }
    };

    if (drawer) {
      onAnimationEnd(drawer, finishClosing, { subtree: false });
      setTimeout(finishClosing, 350);
    } else {
      finishClosing();
    }
  }

  /**
   * Attach animationend event listeners to all animated elements to remove will-change after animation
   * to remove the stacking context and allow submenus to be positioned correctly
   */
  #setupAnimatedElementListeners() {
    const allAnimated = this.querySelectorAll('.menu-drawer__animated-element');
    allAnimated.forEach((element) => {
      element.addEventListener('animationend', removeWillChangeOnAnimationEnd);
    });
  }

  /**
   * Temporarily disables accordion animations to prevent unwanted transitions when the drawer opens.
   * Adds a no-animation class to accordion content elements, then removes it after 100ms to
   * re-enable animations for user interactions.
   * @param {HTMLDetailsElement} details - The details element containing the accordions
   */
  preventInitialAccordionAnimations(details) {
    const content = details.querySelectorAll('accordion-custom .details-content');

    content.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.classList.add('details-content--no-animation');
      }
    });
    setTimeout(() => {
      content.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.classList.remove('details-content--no-animation');
        }
      });
    }, 100);
  }
}

if (!customElements.get('header-drawer')) {
  customElements.define('header-drawer', HeaderDrawer);
}

/**
 * Reset an open details element to its original state
 *
 * @param {HTMLDetailsElement} element
 */
function reset(element) {
  element.classList.remove('menu-open');
  element.removeAttribute('open');
  element.querySelector('summary')?.setAttribute('aria-expanded', 'false');
}
