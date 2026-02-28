/**
 * Orto-Care UX Specification — Tab Navigation
 * Handles tab switching, fade animations, scroll positioning and keyboard navigation
 */

(function () {
  'use strict';

  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  /**
   * Activate a tab panel by its data-tab key.
   * @param {string} target - value of data-tab attribute
   */
  function activateTab(target) {
    // Deactivate all buttons and panels
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => {
      p.classList.remove('active');
      p.style.animation = '';
    });

    const activeBtn   = document.querySelector('.tab-btn[data-tab="' + target + '"]');
    const activePanel = document.getElementById('tab-' + target);

    if (activeBtn)   activeBtn.classList.add('active');

    if (activePanel) {
      activePanel.classList.add('active');
      // Trigger reflow so animation restarts each time
      void activePanel.offsetWidth;
      activePanel.style.animation = 'fadeIn 0.25s ease forwards';
    }

    // Scroll: if the user has scrolled past the nav, bring them back to it
    const nav = document.querySelector('.tab-nav');
    if (!nav) return;
    const navTop = nav.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > navTop + nav.offsetHeight) {
      window.scrollTo({ top: navTop, behavior: 'smooth' });
    }
  }

  // Click handler
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });

  // Keyboard navigation (Arrow keys + Enter/Space)
  const navInner = document.querySelector('.tab-nav-inner');
  if (navInner) {
    navInner.addEventListener('keydown', (e) => {
      const btns = [...tabBtns];
      const focused = document.activeElement;
      const idx = btns.indexOf(focused);

      if (e.key === 'ArrowRight' && idx < btns.length - 1) {
        e.preventDefault();
        btns[idx + 1].focus();
      }
      if (e.key === 'ArrowLeft' && idx > 0) {
        e.preventDefault();
        btns[idx - 1].focus();
      }
      if ((e.key === 'Enter' || e.key === ' ') && idx !== -1) {
        e.preventDefault();
        activateTab(focused.dataset.tab);
      }
    });
  }

  // ── Scroll-fade hint for horizontal scroll wrappers ──
  function initScrollWrappers() {
    document.querySelectorAll('.scroll-wrapper').forEach(wrapper => {
      const scrollId = wrapper.dataset.scrollId;
      const container = scrollId ? document.getElementById(scrollId) : wrapper.querySelector('.scroll-container');
      if (!container) return;

      function checkScroll() {
        const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 4;
        wrapper.classList.toggle('scrolled-end', atEnd);
      }

      container.addEventListener('scroll', checkScroll, { passive: true });
      // Run once on init and after tab switch (content may not be rendered yet)
      setTimeout(checkScroll, 50);
    });
  }

  // Re-init on each tab switch
  const _origActivate = window.ortoCareActivateTab;
  window.ortoCareActivateTab = function(target) {
    _origActivate(target);
    setTimeout(initScrollWrappers, 80);
  };

  // Init on load
  document.addEventListener('DOMContentLoaded', initScrollWrappers);
  // Fallback if DOMContentLoaded already fired
  if (document.readyState !== 'loading') initScrollWrappers();

  // Expose activateTab globally for potential external use
  window.ortoCareActivateTab = activateTab;

})();
