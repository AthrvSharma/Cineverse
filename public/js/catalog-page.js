(function () {
  const root = document.querySelector('[data-catalog-page]');
  if (!root) return;

  function loadCachedMovies() {
    try {
      const snapshot = JSON.parse(localStorage.getItem('cineverse-movie-cache') || 'null');
      return snapshot && snapshot.data ? snapshot.data : {};
    } catch (error) {
      return {};
    }
  }

  const movieMap = window.__CINEVERSE_MOVIES__ && Object.keys(window.__CINEVERSE_MOVIES__).length
    ? window.__CINEVERSE_MOVIES__
    : loadCachedMovies();
  const movieArray = Object.values(movieMap);
  const visibleSource = Array.isArray(window.__CINEVERSE_VISIBLE__) ? window.__CINEVERSE_VISIBLE__ : [];
  const visibleTitleSet = new Set(visibleSource.map(movie => movie.title));
  const user = window.__CINEVERSE_USER__ || {};
  let watchlist = new Set(Array.isArray(window.__CINEVERSE_MYLIST__) ? window.__CINEVERSE_MYLIST__ : []);

  const refs = {
    shell: root.querySelector('[data-hero-shell]'),
    heroSource: root.querySelector('[data-hero-source]'),
    heroTitle: root.querySelector('[data-hero-title]'),
    heroImdb: root.querySelector('[data-hero-imdb]'),
    heroRuntime: root.querySelector('[data-hero-runtime]'),
    heroYear: root.querySelector('[data-hero-year]'),
    heroRating: root.querySelector('[data-hero-rating]'),
    heroDescription: root.querySelector('[data-hero-description]'),
    heroTags: root.querySelector('[data-hero-tags]'),
    heroPoster: root.querySelector('[data-hero-poster]'),
    heroDots: root.querySelector('[data-hero-dots]'),
    heroModalBtn: root.querySelector('[data-hero-modal]'),
    heroSave: root.querySelector('[data-hero-save]'),
    heroImage: root.querySelector('[data-hero-image]'),
    searchInput: document.querySelector('[data-catalog-search]'),
    searchOverlay: document.querySelector('[data-search-overlay]'),
    searchGrid: document.querySelector('[data-search-grid]'),
    searchEmpty: document.querySelector('[data-search-empty]'),
    searchTags: document.querySelector('[data-search-tags]'),
    searchClosers: document.querySelectorAll('[data-search-close]'),
    modal: document.getElementById('movieModal'),
    modalPoster: document.getElementById('modalPoster'),
    modalTitle: document.getElementById('modalTitle'),
    modalMeta: document.getElementById('modalMeta'),
    modalDescription: document.getElementById('modalDescription'),
    modalGenres: document.getElementById('modalGenres'),
    modalDirector: document.getElementById('modalDirector'),
    modalCast: document.getElementById('modalCast'),
    modalTrailer: document.getElementById('modalTrailerLink'),
    modalWatchlist: document.querySelector('[data-modal-watchlist]'),
    posterCard: root.querySelector('.poster-card'),
    posterSound: root.querySelector('.poster-sound'),
    railTrack: root.querySelector('[data-movie-rail]')
  };

  const fallbackMovie = {
    title: 'Add your first movie',
    description: 'This hero panel lights up as soon as you seed the catalog with a film.',
    rating: 0,
    year: new Date().getFullYear(),
    runtime: 'Runtime TBD',
    genres: ['Drama'],
    platform: 'Cineverse',
    poster: 'https://placehold.co/400x600/111/eee?text=Poster',
    backdrop: 'https://placehold.co/1600x900/1e1f28/fff?text=Cineverse',
    director: 'Unknown',
    cast: [],
    trailerUrl: ''
  };

  const normalized = movieArray.map(movie => ({
    title: movie.title,
    description: movie.description || 'No description yet.',
    rating: Number(movie.rating || 0),
    year: movie.year || '—',
    runtime: movie.runtime || '—',
    genres: movie.genres || [],
    platform: movie.platform || movie.service || 'Featured',
    poster: movie.poster,
    backdrop: movie.backdrop,
    director: movie.director || 'Unknown',
    cast: movie.cast || [],
    trailerUrl: movie.trailerUrl || '',
    id: movie.id
  }));

  const movieLookup = normalized.reduce((acc, movie) => {
    acc[movie.title] = movie;
    return acc;
  }, {});
  movieLookup[fallbackMovie.title] = fallbackMovie;

  const defaultQueue = visibleTitleSet.size
    ? normalized.filter(movie => visibleTitleSet.has(movie.title))
    : normalized;
  let heroQueue = defaultQueue.length ? defaultQueue : [fallbackMovie];
  let heroIndex = 0;
  let heroInterval;
  const searchTags = Array.from(
    new Set(
      normalized
        .flatMap(movie => (movie.genres || []).slice(0, 2))
        .filter(Boolean)
        .slice(0, 10)
    )
  );

  function formatMeta(movie) {
    const year = movie.year || '—';
    const runtime = movie.runtime || '—';
    return `${runtime} • ${year}`;
  }

  function renderHero(movie) {
    if (!movie) movie = fallbackMovie;
    const queuePosition = heroQueue.findIndex(item => item.title === movie.title);
    if (queuePosition >= 0) heroIndex = queuePosition;
    if (refs.heroSource) refs.heroSource.textContent = movie.platform || 'Featured';
    if (refs.heroTitle) refs.heroTitle.textContent = movie.title;
    if (refs.heroImdb) refs.heroImdb.textContent = `IMDb ${movie.rating ? movie.rating.toFixed(1) : '0.0'}`;
    if (refs.heroRuntime) refs.heroRuntime.textContent = movie.runtime || '—';
    if (refs.heroYear) refs.heroYear.textContent = movie.year || '—';
    if (refs.heroRating) refs.heroRating.textContent = movie.ratingCategory || '18+';
    if (refs.heroDescription) refs.heroDescription.textContent = movie.description;
    if (refs.heroImage) refs.heroImage.style.backgroundImage = `linear-gradient(90deg, rgba(3,4,8,0.96) 0%, rgba(3,4,8,0.75) 34%, rgba(3,4,8,0.35) 60%, rgba(3,4,8,0.0) 78%), url('${movie.backdrop || movie.poster || fallbackMovie.backdrop}')`;
    if (refs.heroPoster) refs.heroPoster.src = movie.poster || movie.backdrop || fallbackMovie.poster;
    if (refs.heroTags) {
      const tags = movie.genres && movie.genres.length ? movie.genres.slice(0, 3) : ['Drama'];
      refs.heroTags.innerHTML = tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('');
    }
    if (refs.heroSave) {
      const saved = watchlist.has(movie.title);
      refs.heroSave.textContent = saved ? 'Saved' : 'Watchlist';
      refs.heroSave.classList.toggle('active', saved);
      refs.heroSave.dataset.title = movie.title;
    }
    updateDots();
  }

  function updateDots() {
    if (!refs.heroDots) return;
    refs.heroDots.innerHTML = heroQueue
      .map((_, idx) => `<span data-dot-index="${idx}" class="${idx === heroIndex ? 'active' : ''}"></span>`)
      .join('');
  }

  function startHeroCycle() {
    if (heroInterval) clearInterval(heroInterval);
    if (heroQueue.length <= 1) return;
    heroInterval = setInterval(() => {
      heroIndex = (heroIndex + 1) % heroQueue.length;
      renderHero(heroQueue[heroIndex]);
    }, 6000);
  }

  function openModal(title) {
    const movie = movieLookup[title] || heroQueue.find(item => item.title === title) || fallbackMovie;
    if (refs.modalPoster) refs.modalPoster.src = movie.poster || fallbackMovie.poster;
    if (refs.modalTitle) refs.modalTitle.textContent = movie.title;
    if (refs.modalMeta) refs.modalMeta.textContent = formatMeta(movie);
    if (refs.modalDescription) refs.modalDescription.textContent = movie.description;
    if (refs.modalDirector) refs.modalDirector.textContent = movie.director;
    if (refs.modalCast) refs.modalCast.textContent = movie.cast && movie.cast.length ? movie.cast.join(', ') : '—';
    if (refs.modalGenres) {
      refs.modalGenres.innerHTML = (movie.genres || []).map(tag => `<span>${tag}</span>`).join('');
    }
    if (refs.modalTrailer) {
      if (movie.trailerUrl) {
        refs.modalTrailer.href = movie.trailerUrl;
        refs.modalTrailer.style.display = 'inline-flex';
        refs.modalTrailer.dataset.title = movie.title;
      } else {
        refs.modalTrailer.style.display = 'none';
        delete refs.modalTrailer.dataset.title;
      }
    }
    if (refs.modalWatchlist) {
      const saved = watchlist.has(movie.title);
      refs.modalWatchlist.dataset.title = movie.title;
      refs.modalWatchlist.textContent = saved ? 'Saved' : 'Add to watchlist';
      refs.modalWatchlist.classList.toggle('active', saved);
    }
    refs.modal?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    refs.modal?.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  async function syncWatchlist(title, add) {
    if (!user || !user.id) return;
    await fetch(add ? '/movies/list/add' : '/movies/list/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieTitle: title })
    });
  }

  function updateInlineWatchButtons(title) {
    root
      ?.querySelectorAll('[data-watchlist-btn]')
      .forEach(button => {
        if (button.dataset.watchlistBtn === title) {
          updateWatchButton(button, watchlist.has(title));
        }
      });
  }

  function updateWatchButton(button, saved) {
    if (!button) return;
    button.classList.toggle('active', saved);
    button.classList.toggle('is-saved', saved);
    const icon = button.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-check', saved);
      icon.classList.toggle('fa-bookmark', !saved);
    }
    const label = button.querySelector('span');
    if (label) {
      label.textContent = saved ? 'Saved' : 'Save';
    } else {
      button.textContent = saved ? 'Saved' : 'Save';
    }
  }

  async function toggleWatchlist(title) {
    if (!title) return;
    const already = watchlist.has(title);
    if (already) {
      watchlist.delete(title);
    } else {
      watchlist.add(title);
    }
    window.__CINEVERSE_MYLIST__ = Array.from(watchlist);
    renderHero(heroQueue[heroIndex]);
    updateInlineWatchButtons(title);
    if (refs.modalWatchlist && refs.modalWatchlist.dataset.title === title) {
      const saved = watchlist.has(title);
      refs.modalWatchlist.textContent = saved ? 'Saved' : 'Add to watchlist';
      refs.modalWatchlist.classList.toggle('active', saved);
    }
    try {
      await syncWatchlist(title, !already);
    } catch (error) {
      if (already) {
        watchlist.add(title);
      } else {
        watchlist.delete(title);
      }
      renderHero(heroQueue[heroIndex]);
      updateInlineWatchButtons(title);
    }
  }

  function trackTrailerView(title) {
    if (!title) return;
    const payload = JSON.stringify({ movieTitle: title });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/movies/engagement/trailer', blob);
      return;
    }
    fetch('/movies/engagement/trailer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    }).catch(() => {});
  }

  function applySearch(term) {
    const value = term.trim().toLowerCase();
    if (!value) {
      heroQueue = defaultQueue.length ? defaultQueue : [fallbackMovie];
    } else {
      heroQueue = defaultQueue.filter(movie => movie.title.toLowerCase().includes(value));
      if (!heroQueue.length) heroQueue = [fallbackMovie];
      if (refs.searchOverlay && !refs.searchOverlay.classList.contains('is-open')) {
        openSearchOverlay();
      }
    }
    heroIndex = 0;
    renderHero(heroQueue[heroIndex]);
    startHeroCycle();
    renderSearchResults(value);
  }

  function openSearchOverlay() {
    if (!refs.searchOverlay) return;
    refs.searchOverlay.classList.add('is-open');
    document.body.classList.add('is-search-open');
  }

  function closeSearchOverlay() {
    if (!refs.searchOverlay) return;
    refs.searchOverlay.classList.remove('is-open');
    document.body.classList.remove('is-search-open');
    if (refs.searchInput && !refs.searchInput.value && refs.searchGrid) {
      refs.searchGrid.innerHTML = '';
      if (refs.searchEmpty) refs.searchEmpty.style.display = 'block';
    }
  }

  function buildSearchCard(movie) {
    const platform = movie.platform || 'Featured';
    const rating = movie.rating ? movie.rating.toFixed(1) : '0.0';
    const poster = movie.poster || movie.backdrop || 'https://placehold.co/320x180/111/eee?text=Poster';
    return `
      <article class="search-results-card" data-search-result="${movie.title}">
        <img src="${poster}" alt="${movie.title} poster">
        <div class="search-results-card__body">
          <div class="search-results-card__meta">
            <span>${platform}</span>
            <span>IMDb ${rating}</span>
          </div>
          <h4>${movie.title}</h4>
          <p class="helper-text">${movie.year || '—'} • ${(movie.genres || []).slice(0, 2).join(', ')}</p>
        </div>
      </article>
    `;
  }

  function renderSearchResults(term) {
    if (!refs.searchGrid) return;
    const query = term.trim().toLowerCase();
    if (!query) {
      refs.searchGrid.innerHTML = '';
      if (refs.searchEmpty) refs.searchEmpty.style.display = 'block';
      return;
    }
    const results = normalized
      .filter(movie => {
        const titleMatch = movie.title.toLowerCase().includes(query);
        const genreMatch = (movie.genres || []).some(tag => tag.toLowerCase().includes(query));
        const platformMatch = (movie.platform || '').toLowerCase().includes(query);
        return titleMatch || genreMatch || platformMatch;
      })
      .slice(0, 24);
    refs.searchGrid.innerHTML = results.map(buildSearchCard).join('');
    if (refs.searchEmpty) refs.searchEmpty.style.display = results.length ? 'none' : 'block';
  }

  function renderSearchChips() {
    if (!refs.searchTags) return;
    const chips = searchTags.length ? searchTags : ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Romance'];
    refs.searchTags.innerHTML = chips.map(tag => `<button type="button" data-search-chip="${tag}">${tag}</button>`).join('');
  }

  function attachEvents() {
    refs.heroModalBtn?.addEventListener('click', () => {
      const current = heroQueue[heroIndex];
      openModal(current.title);
    });

    refs.heroSave?.addEventListener('click', event => {
      const title = event.currentTarget.dataset.title;
      toggleWatchlist(title);
    });

    refs.heroDots?.addEventListener('click', event => {
      const target = event.target.closest('[data-dot-index]');
      if (!target) return;
      heroIndex = Number(target.dataset.dotIndex);
      renderHero(heroQueue[heroIndex]);
      startHeroCycle();
    });

    refs.modal?.addEventListener('click', event => {
      if (event.target === refs.modal || event.target.hasAttribute('data-modal-close')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeModal();
    });

    refs.modalWatchlist?.addEventListener('click', event => {
      const title = event.currentTarget.dataset.title;
      toggleWatchlist(title);
    });

    refs.modalTrailer?.addEventListener('click', () => {
      const title = refs.modalTrailer.dataset.title;
      if (title) {
        trackTrailerView(title);
      }
    });

    refs.searchInput?.addEventListener('input', event => applySearch(event.target.value));
    refs.searchInput?.addEventListener('focus', () => {
      openSearchOverlay();
      renderSearchResults(refs.searchInput.value || '');
    });

    refs.posterCard?.addEventListener('click', () => {
      const current = heroQueue[heroIndex];
      openModal(current.title);
    });

    refs.posterSound?.addEventListener('click', event => {
      event.stopPropagation();
      refs.posterSound.classList.toggle('active');
    });

    document.addEventListener('keydown', event => {
      const activeTag = document.activeElement?.tagName;
      const isFormField = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !isFormField) {
        event.preventDefault();
        refs.searchInput?.focus();
      }
      if (event.key === 'Escape' && refs.searchOverlay?.classList.contains('is-open')) {
        closeSearchOverlay();
      }
    });

    root.addEventListener('click', event => {
      const watchBtn = event.target.closest('[data-watchlist-btn]');
      if (watchBtn) {
        const title = watchBtn.dataset.watchlistBtn;
        toggleWatchlist(title);
        return;
      }
      if (event.target.closest('[data-rail-edit]')) {
        return;
      }
      const cardTrigger = event.target.closest('[data-movie-card]');
      if (cardTrigger) {
        openModal(cardTrigger.dataset.movieCard);
      }
      const searchResult = event.target.closest('[data-search-result]');
      if (searchResult) {
        openModal(searchResult.dataset.searchResult);
        closeSearchOverlay();
      }
    });

    attachRailHover();
    renderSearchChips();

    refs.searchTags?.addEventListener('click', event => {
      const chip = event.target.closest('[data-search-chip]');
      if (!chip) return;
      const term = chip.dataset.searchChip;
      if (refs.searchInput) {
        refs.searchInput.value = term;
        refs.searchInput.focus();
        applySearch(term);
        renderSearchResults(term);
      }
    });

    refs.searchClosers?.forEach(closeBtn => {
      closeBtn.addEventListener('click', () => closeSearchOverlay());
    });

    refs.searchOverlay?.addEventListener('click', event => {
      const resultCard = event.target.closest('[data-search-result]');
      if (resultCard) {
        openModal(resultCard.dataset.searchResult);
        closeSearchOverlay();
      }
      if (event.target === refs.searchOverlay || event.target.closest('[data-search-close]')) {
        closeSearchOverlay();
      }
    });

    if (refs.shell) {
      refs.shell.addEventListener('mousemove', event => {
        const rect = refs.shell.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        refs.shell.style.transform = `perspective(1200px) rotateX(${y * -6}deg) rotateY(${x * 10}deg)`;
        if (refs.heroImage) {
          refs.heroImage.style.transform = `translateZ(-60px) scale(1.18) translate(${x * -18}px, ${y * -18}px)`;
        }
      });
      refs.shell.addEventListener('mouseleave', () => {
        refs.shell.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
        if (refs.heroImage) refs.heroImage.style.transform = 'translateZ(-40px) scale(1.15)';
      });
      refs.shell.addEventListener('mouseenter', () => {
        if (heroInterval) clearInterval(heroInterval);
      });
      refs.shell.addEventListener('mouseleave', () => startHeroCycle());
    }

    window.addEventListener('cineverse:openMovie', event => {
      const title = event.detail?.title;
      if (title) {
        openModal(title);
      }
    });
  }

  function attachRailHover() {
    const cards = root.querySelectorAll('[data-movie-card-hover]');
    if (!cards.length) return;
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => handleRailHover(card.dataset.movieCardHover));
      card.addEventListener('focus', () => handleRailHover(card.dataset.movieCardHover));
    });
    refs.railTrack?.addEventListener('mouseleave', () => {
      highlightRailCard(null);
      startHeroCycle();
    });
  }

  function handleRailHover(title) {
    if (!title) return;
    const movie = movieLookup[title];
    if (!movie) return;
    highlightRailCard(title);
    renderHero(movie);
    if (heroInterval) clearInterval(heroInterval);
  }

  function highlightRailCard(title) {
    root
      .querySelectorAll('[data-movie-card-hover]')
      .forEach(card => card.classList.toggle('is-focused', Boolean(title) && card.dataset.movieCardHover === title));
  }

  function runEntranceAnimation() {
    if (!window.gsap) return;
    window.gsap.from('.top-nav', { y: -40, opacity: 0, duration: 0.7, ease: 'power3.out' });
    window.gsap.from('.side-rail', { x: -40, opacity: 0, duration: 0.7, delay: 0.2, ease: 'power3.out' });
    window.gsap.from('[data-hero-shell]', { y: 40, opacity: 0, duration: 0.9, delay: 0.15, ease: 'power3.out' });
    window.gsap.from('.streaming-platform-row .stream-card', {
      y: 30,
      opacity: 0,
      duration: 0.7,
      delay: 0.35,
      stagger: 0.06,
      ease: 'power3.out'
    });
    window.gsap.from('.rail-card', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: 0.45,
      stagger: 0.05,
      ease: 'power3.out'
    });
    window.gsap.from('.membership-banner, .ai-section', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: 0.4,
      ease: 'power3.out'
    });
    window.gsap.from('.ai-card', {
      y: 20,
      opacity: 0,
      duration: 0.7,
      delay: 0.55,
      stagger: 0.06,
      ease: 'power3.out'
    });
  }

  renderHero(heroQueue[heroIndex]);
  startHeroCycle();
  attachEvents();
  runEntranceAnimation();
})();
