(() => {
  const section = document.querySelector('.lux-trust-section');
  if (!section || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = section.querySelectorAll('.lux-trust-card');
  if (!cards.length) return;

  section.classList.add('about-motion-ready');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

  cards.forEach((card) => observer.observe(card));
})();
