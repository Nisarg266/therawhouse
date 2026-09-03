/**
 * The House of Things - Luxury Scroll Reveal & Slider Touch Observer
 * Adds smooth IntersectionObserver reveals, parallax nuances, and mobile touch slider controls.
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Intersection Observer for Scroll Reveals
  const revealElements = document.querySelectorAll('[data-about-reveal]');
  
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Optional: once revealed, unobserve to keep performance high
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver not supported
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }

  // 2. Active Dot Tracker for Mobile Horizontal Sliders
  const mobileSliders = document.querySelectorAll('.about-mobile-slider');
  
  mobileSliders.forEach((slider) => {
    const parent = slider.closest('.about-slider-wrapper') || slider.parentElement;
    const dots = parent ? parent.querySelectorAll('.about-slider-dot') : [];
    
    if (dots.length > 0) {
      slider.addEventListener('scroll', () => {
        const scrollLeft = slider.scrollLeft;
        const width = slider.offsetWidth;
        const activeIndex = Math.round(scrollLeft / width);

        dots.forEach((dot, index) => {
          if (index === activeIndex) {
            dot.classList.add('is-active');
          } else {
            dot.classList.remove('is-active');
          }
        });
      }, { passive: true });
    }
  });

  // 3. Stats Counter Animation
  const statNumbers = document.querySelectorAll('.about-stats__number[data-count]');
  if ('IntersectionObserver' in window && statNumbers.length > 0) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          
          if (!isNaN(target)) {
            let count = 0;
            const duration = 1600; // ms
            const stepTime = 25;
            const steps = duration / stepTime;
            const increment = target / steps;

            const timer = setInterval(() => {
              count += increment;
              if (count >= target) {
                el.textContent = `${prefix}${target}${suffix}`;
                clearInterval(timer);
              } else {
                el.textContent = `${prefix}${Math.floor(count)}${suffix}`;
              }
            }, stepTime);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    statNumbers.forEach((num) => countObserver.observe(num));
  }
});
