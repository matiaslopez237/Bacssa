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

// Sapiens tablet: slides in from the right on scroll, hides again if scrolled past
const tabletWrap = document.querySelector('.tablet-wrap');
if (tabletWrap) {
  const tabletObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -25% 0px' });
  tabletObserver.observe(tabletWrap);
}

// Services carousel dots
const track = document.getElementById('services-track');
const dotsWrap = document.getElementById('services-dots');
const cards = track ? Array.from(track.children) : [];

if (track && dotsWrap) {
  // Fixed number of dots representing scroll progress (not one per card),
  // so the indicator doesn't imply more content than there visually is.
  const DOT_COUNT = 3;
  for (let i = 0; i < DOT_COUNT; i++) {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      track.scrollTo({ left: (i / (DOT_COUNT - 1)) * maxScroll, behavior: 'smooth' });
    });
    dotsWrap.appendChild(dot);
  }

  const dots = Array.from(dotsWrap.children);
  const updateActiveDot = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const progress = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
    const activeIndex = Math.round(progress * (DOT_COUNT - 1));
    dots.forEach((d, i) => d.classList.toggle('active', i === activeIndex));
  };
  track.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateActiveDot);
  });

  // Drag-to-scroll with mouse (touch keeps native momentum scrolling)
  let isDragging = false;
  let dragStartX = 0;
  let scrollStart = 0;
  let dragMoved = false;

  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragMoved = false;
    dragStartX = e.pageX;
    scrollStart = track.scrollLeft;
    track.classList.add('dragging');
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.pageX - dragStartX;
    if (Math.abs(dx) > 8) dragMoved = true;
    track.scrollLeft = scrollStart - dx;
  });

  const stopDragging = () => {
    isDragging = false;
    track.classList.remove('dragging');
  };
  window.addEventListener('mouseup', stopDragging);
  track.addEventListener('mouseleave', () => { if (isDragging) stopDragging(); });

  // Prevent the trailing click from firing after an actual drag
  track.addEventListener('click', (e) => {
    if (dragMoved) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // Click (or Enter/Space) expands a card in place to reveal its description
  const toggleCard = (card) => {
    const wasExpanded = card.classList.contains('service-card--expanded');
    cards.forEach((c) => {
      c.classList.remove('service-card--expanded');
      c.setAttribute('aria-expanded', 'false');
    });
    if (!wasExpanded) {
      card.classList.add('service-card--expanded');
      card.setAttribute('aria-expanded', 'true');
      card.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  };
  cards.forEach((card) => {
    card.addEventListener('click', () => toggleCard(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(card);
      }
    });
  });
}

// Map hotspot tooltips (bases & offices)
const mapTooltip = document.getElementById('map-tooltip');
const hotspots = document.querySelectorAll('.map-hotspot');
if (mapTooltip && hotspots.length) {
  const mapContainer = mapTooltip.parentElement;
  const locationItems = document.querySelectorAll('.location-list li');
  hotspots.forEach((spot) => {
    const matchingItem = Array.from(locationItems).find((li) => li.dataset.label === spot.dataset.label);
    const showTooltip = () => {
      const spotRect = spot.getBoundingClientRect();
      const containerRect = mapContainer.getBoundingClientRect();
      mapTooltip.textContent = spot.dataset.label;
      mapTooltip.style.left = `${spotRect.left + spotRect.width / 2 - containerRect.left}px`;
      mapTooltip.style.top = `${spotRect.top - containerRect.top}px`;
      mapTooltip.classList.add('visible');
      spot.classList.add('is-highlighted');
      if (matchingItem) matchingItem.classList.add('is-highlighted');
    };
    const hideTooltip = () => {
      mapTooltip.classList.remove('visible');
      spot.classList.remove('is-highlighted');
      if (matchingItem) matchingItem.classList.remove('is-highlighted');
    };
    spot.addEventListener('mouseenter', showTooltip);
    spot.addEventListener('mouseleave', hideTooltip);
    spot.addEventListener('touchstart', (e) => { e.stopPropagation(); showTooltip(); }, { passive: true });
    spot.addEventListener('click', () => {
      const query = encodeURIComponent(spot.dataset.maps || spot.dataset.label);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener');
    });
    if (matchingItem) {
      matchingItem.addEventListener('mouseenter', showTooltip);
      matchingItem.addEventListener('mouseleave', hideTooltip);
    }
  });
  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.map-hotspot')) hideAllTooltips();
  }, { passive: true });
  function hideAllTooltips() { mapTooltip.classList.remove('visible'); }
}
