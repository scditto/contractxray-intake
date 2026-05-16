/* =========================================================
   Contract X-Ray site - shared scrollspy
   Highlights the current section in the sidebar TOC as the
   user scrolls. Mobile: collapsible top pill.
   ========================================================= */

(function() {
  'use strict';

  function init() {
    const sidebar = document.querySelector('.scrollspy');
    const pill    = document.querySelector('.scrollspy-pill');
    if (!sidebar && !pill) return;

    // Collect anchor targets from BOTH the sidebar and the pill so any
    // section linked to gets observed. We dedupe by href.
    const links = new Map(); // hash -> [<a> elements]
    const collect = (root) => {
      if (!root) return;
      root.querySelectorAll('a[href^="#"]').forEach((a) => {
        const hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        if (!links.has(hash)) links.set(hash, []);
        links.get(hash).push(a);
      });
    };
    collect(sidebar);
    collect(pill);

    // Resolve each hash to its target element and remember in order
    const targets = [];
    links.forEach((aList, hash) => {
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        targets.push({ id, el, aList, hash });
      }
    });
    if (targets.length === 0) return;

    // Sort targets by their position in the document
    targets.sort((a, b) => {
      const pos = a.el.compareDocumentPosition(b.el);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    const setActive = (activeId) => {
      targets.forEach(({ id, aList }) => {
        const active = id === activeId;
        aList.forEach((a) => a.classList.toggle('is-active', active));
      });
    };

    // Track which targets are currently intersecting
    const visible = new Set();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          visible.add(id);
        } else {
          visible.delete(id);
        }
      });
      // Pick the first (topmost) target that is currently visible
      const firstVisible = targets.find((t) => visible.has(t.id));
      if (firstVisible) {
        setActive(firstVisible.id);
      } else {
        // Nothing visible: keep the one just above the viewport active
        const scrollY = window.scrollY + 120;
        let lastAbove = null;
        for (const t of targets) {
          if (t.el.offsetTop <= scrollY) lastAbove = t;
          else break;
        }
        if (lastAbove) setActive(lastAbove.id);
      }
    }, {
      // Trigger when the top of a section crosses ~25% from the top of the viewport
      rootMargin: '-15% 0px -65% 0px',
      threshold: 0,
    });

    targets.forEach(({ el }) => observer.observe(el));

    // Smooth scroll on click and update URL hash without jumping
    links.forEach((aList, hash) => {
      aList.forEach((a) => {
        a.addEventListener('click', (e) => {
          const id = hash.slice(1);
          const el = document.getElementById(id);
          if (!el) return;
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', hash);
          // Close mobile pill after selection
          if (pill && pill.getAttribute('data-open') === 'true') {
            pill.setAttribute('data-open', 'false');
          }
        });
      });
    });

    // Mobile pill toggle
    if (pill) {
      const toggle = pill.querySelector('.scrollspy-pill-toggle');
      if (toggle) {
        toggle.addEventListener('click', () => {
          const open = pill.getAttribute('data-open') === 'true';
          pill.setAttribute('data-open', open ? 'false' : 'true');
        });
      }
      // Update the pill label to show the active section name
      const updatePillLabel = () => {
        const labelEl = pill.querySelector('.scrollspy-pill-current');
        if (!labelEl) return;
        const active = targets.find((t) =>
          t.aList.some((a) => a.classList.contains('is-active'))
        );
        if (active) {
          const link = active.aList[0];
          labelEl.textContent = link ? link.textContent.trim() : '';
        }
      };
      // Run on every observer update
      const origSetActive = setActive;
      const wrappedSetActive = (id) => { origSetActive(id); updatePillLabel(); };
      // Replace the closure reference by re-binding — simplest: call updatePillLabel on scroll
      let raf = null;
      window.addEventListener('scroll', () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          updatePillLabel();
          raf = null;
        });
      }, { passive: true });
      updatePillLabel();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
