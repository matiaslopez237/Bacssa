// Header background on scroll
const header = document.getElementById('site-header');
const onScroll = () => {
  if (window.scrollY > 40) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll);
onScroll();

// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// Animated stat counters (hero)
const counters = document.querySelectorAll('.stat-num[data-count]');
const animateCounter = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.round(progress * target);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach((c) => counterObserver.observe(c));

// Services carousel dots
const track = document.getElementById('services-track');
const dotsWrap = document.getElementById('services-dots');
const cards = track ? Array.from(track.children) : [];

if (track && dotsWrap) {
  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);
  const updateActiveDot = () => {
    const trackRect = track.getBoundingClientRect();
    let closestIndex = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.getBoundingClientRect().left - trackRect.left);
      if (dist < closestDist) { closestDist = dist; closestIndex = i; }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === closestIndex));
  };
  track.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateActiveDot);
  });
}
