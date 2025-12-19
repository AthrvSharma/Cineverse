(function () {
  const root = document.querySelector('[data-platform-page]') || document.querySelector('.admin-console');
  if (!root) return;

  const searchInput = document.querySelector('[data-catalog-search]');
  const cards = Array.from(root.querySelectorAll('.admin-card'));
  const emptyState = root.querySelector('[data-platform-empty]');

  function filter(term) {
    const value = (term || '').trim().toLowerCase();
    let visibleCount = 0;
    cards.forEach(card => {
      const haystack = (card.dataset.searchHaystack || '').toLowerCase();
      const matches = !value || haystack.includes(value);
      card.style.display = matches ? 'flex' : 'none';
      if (matches) visibleCount += 1;
    });
    if (emptyState) {
      emptyState.style.display = visibleCount ? 'none' : 'block';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', event => filter(event.target.value));
    if (searchInput.value) filter(searchInput.value);
  }
})();
