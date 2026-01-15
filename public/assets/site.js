
/// This part displays all the packages


function planPanelTemplate(plan) {
  return `
    <div class="plan-panel" data-plan="${plan.code}">
      <div class="region-grid">
        ${plan.countries.map(country => `
          <div class="pricing-card">
            <h3>${country.name}</h3>
            <ul class="operators-list">
              ${country.isps.map(i => `<li>${i}</li>`).join('')}
            </ul>
            <a class="btn btn-primary" href="${country.buyLink}">
              $${country.price} Buy now
            </a>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPlans(plans) {
  const planPanelsEl = document.getElementById('planPanels');
  const billingToggleEl = document.getElementById('billingToggle');
  if (!billingToggleEl || !planPanelsEl) {
    console.error('Billing containers missing from DOM');
    return;
  }
  // Render buttons
  plans.forEach((plan, index) => {
    const btn = document.createElement('button');
    btn.classList.add('billing-option');
    if(index === 0) btn.classList.add('active'); // first active
    btn.dataset.plan = plan.code;
    btn.textContent = plan.label;
    billingToggleEl.appendChild(btn);
  });

  // Render plan panels
  plans.forEach(plan => {
    const panelHTML = planPanelTemplate(plan);
    planPanelsEl.insertAdjacentHTML('beforeend', panelHTML);
  });

  // Initialize toggle functionality
  const buttons = document.querySelectorAll('.billing-option[data-plan]');
  const panels = document.querySelectorAll('.plan-panel[data-plan]');

  function setActive(plan) {
    buttons.forEach(b => b.classList.toggle('active', b.dataset.plan === plan));
    panels.forEach(p => p.classList.toggle('active', p.dataset.plan === plan));
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      setActive(this.dataset.plan);

      // Scroll the selected panel into view horizontally
      const panelGrid = document.querySelector(`.plan-panel[data-plan="${this.dataset.plan}"] .region-grid`);
      panelGrid?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
    });
  });

  // Make the first panel active and scroll it into view on load
  if (panels.length > 0) {
    panels[0].classList.add('active');
    panels[0].querySelector('.region-grid')?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
  }
}


function transformPricingData(data) {
  const result = {};

  for (const item of data) {
    const { country, isp, period, price } = item;

    if (period === "0") continue;


    if (!result[period]) {
      result[period] = {
        code: `d${period}`,
        label: `${period} day`,
        countries: {}
      };
    }


    if (!result[period].countries[country]) {
      result[period].countries[country] = {
        name: capitalize(country),
        isps: new Set(),
        price: Number(price),
        buyLink: "https://t.me/GlobalProxy_bot"
      };
    }


    result[period].countries[country].isps.add(isp);
  }


  return Object.values(result).map(period => ({
    ...period,
    countries: Object.values(period.countries).map(c => ({
      ...c,
      isps: [...c.isps]
    }))
  }));
}


function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}



  async function loadPricing() {
      try {
          const res = await fetch('https://globalproxy.store/products/productsprice');
          if (!res.ok) throw new Error('Pricing fetch failed');
          data = await res.json();
          const finalData = transformPricingData(data.message)
          renderPlans(finalData);
      } catch (err) {
          console.error('Pricing error:', err);
      }
  };


  loadPricing(); 


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
