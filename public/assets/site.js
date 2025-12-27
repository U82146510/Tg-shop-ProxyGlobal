(function () {
  const buttons = document.querySelectorAll('.billing-option[data-plan]');
  const panels = document.querySelectorAll('.plan-panel[data-plan]');
  if (!buttons.length || !panels.length) return;

  function setActive(plan) {
    buttons.forEach(b => b.classList.toggle('active', b.dataset.plan === plan));
    panels.forEach(p => p.classList.toggle('active', p.dataset.plan === plan));
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      setActive(this.dataset.plan);
    });
  });
})();

(function () {
  function getHeaderHeight() {
    var nav = document.querySelector('nav');
    return nav ? nav.offsetHeight : 0;
  }

  function scrollToSection(el) {
    if (!el) return;
    var headerH = getHeaderHeight();
    var rect = el.getBoundingClientRect();
    var targetTop = rect.top + window.pageYOffset;

    // Center the section in the visible area (below fixed header)
    var visibleH = window.innerHeight - headerH;
    var sectionH = el.offsetHeight || rect.height || 0;

    var targetCenter = targetTop + (sectionH / 2);
    var viewportCenter = window.pageYOffset + headerH + (visibleH / 2);

    var top = window.pageYOffset + (targetCenter - viewportCenter);

    // Keep a small safety offset so header never overlaps
    top = top - 8;

    if (top < 0) top = 0;

    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  // Click handler for all in-page anchors
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;

    var href = a.getAttribute('href');
    if (!href || href === '#') return;

    var id = href.slice(1);
    var el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();

    // Close mobile menu if open (if your template toggles a class)
    document.body.classList.remove('menu-open');

    scrollToSection(el);

    // Keep URL hash in address bar (without jump)
    if (history && history.pushState) {
      history.pushState(null, '', href);
    } else {
      location.hash = href;
    }
  });

  // If page loads with a hash, center it after render
  window.addEventListener('load', function () {
    if (location.hash && location.hash.length > 1) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(function () { scrollToSection(el); }, 50);
      }
    }
  });
})();

// Set current year in footer
(function(){
  var y=document.getElementById('year');
  if(y){ y.textContent = new Date().getFullYear(); }
})();

// Smooth scroll for internal anchor links
(function(){
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]');
    if(!a) return;
    var id = a.getAttribute('href');
    if(id.length<=1) return;
    var el = document.querySelector(id);
    if(!el) return;
    e.preventDefault();
    el.scrollIntoView({behavior:'smooth', block:'start'});
  });
})();
