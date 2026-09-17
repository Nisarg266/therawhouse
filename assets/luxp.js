/**
 * THE RAW HOUSE — LUXP shared runtime (minimal, dependency-free).
 * 1. Hero slider: instant slide switching by default (no fade/slide motion
 *    unless the section opts in via data-luxp-transition="fade" AND the
 *    animations toggle is on). Autoplay pauses for reduced-motion users,
 *    hover, and focus.
 * 2. View more / view less toggles for collapsible grids.
 */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------- Hero slider ---------------- */
  function initHero(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-luxp-slide]'));
    if (slides.length === 0) return;

    var dotsWrap = root.querySelector('[data-luxp-dots]');
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
    var prevBtn = root.querySelector('[data-luxp-prev]');
    var nextBtn = root.querySelector('[data-luxp-next]');
    var autoplay = root.getAttribute('data-luxp-autoplay') === 'true';
    var speed = parseInt(root.getAttribute('data-luxp-speed') || '6', 10) * 1000;
    var transition = root.getAttribute('data-luxp-transition') || 'none';
    var index = 0;
    var timer = null;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
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

    if (prevBtn) prevBtn.addEventListener('click', function () { stop(); goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stop(); goTo(index + 1); });
    dots.forEach(function (dot, n) {
      dot.addEventListener('click', function () { stop(); goTo(n); });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { stop(); goTo(index - 1); }
      if (event.key === 'ArrowRight') { stop(); goTo(index + 1); }
    });

    reducedMotion.addEventListener('change', function () {
      if (reducedMotion.matches) stop();
    });

    goTo(0);
    start();
    root.setAttribute('data-luxp-ready', 'true');
  }

  /* ---------------- View more / less ---------------- */
  function initToggle(root) {
    var btn = root.querySelector('[data-luxp-toggle]');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      if (e) e.preventDefault();
      var expanded = root.getAttribute('data-luxp-expanded') === 'true';
      if (expanded) {
        root.setAttribute('data-luxp-expanded', 'false');
        btn.textContent = btn.getAttribute('data-luxp-more') || 'VIEW MORE';
        btn.setAttribute('aria-expanded', 'false');
        var rect = root.getBoundingClientRect();
        if (rect.top < -50) {
          root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        root.setAttribute('data-luxp-expanded', 'true');
        btn.textContent = btn.getAttribute('data-luxp-less') || 'VIEW LESS';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function init(node) {
    (node || document).querySelectorAll('[data-luxp-hero]').forEach(initHero);
    (node || document).querySelectorAll('[data-luxp-collapsible]').forEach(initToggle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }

  document.addEventListener('shopify:section:load', function (event) { init(event.target); });
})();
