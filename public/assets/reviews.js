// Fetch and render last 3 reviews
async function loadReviews() {
  try {
    const response = await fetch('https://globalproxy.store/reviews');
    if (!response.ok) throw new Error('Failed to fetch reviews');
    const reviews = await response.json();
    const lastThree = reviews.slice(-3).reverse();
    const grid = document.querySelector('.testimonials-grid');
    if (!grid) return;
    grid.innerHTML = lastThree.map(r => {
      const name = r.name || r.user || 'Anonymous';
      const text = r.text || r.comment || r.review || '';
      const title = r.title || 'Client';
      return `
        <div class="testimonial-card">
          <div class="testimonial-stars">${'★'.repeat(r.stars || 5)}</div>
          <p>"${text}"</p>
          <div class="testimonial-author">
            <div>
              <div class="testimonial-name">${name}</div>
              <div class="testimonial-title">${title}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    // fallback: show error or static reviews
  }
}

document.addEventListener('DOMContentLoaded', loadReviews);
