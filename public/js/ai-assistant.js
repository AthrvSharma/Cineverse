(function () {
  const recGrid = document.querySelector('[data-ai-rec-grid]');
  const refreshBtn = document.querySelector('[data-ai-refresh]');
  const visibleMovies = Array.isArray(window.__CINEVERSE_VISIBLE__) ? window.__CINEVERSE_VISIBLE__ : [];

  const aiState = {
    recs: Array.isArray(window.__CINEVERSE_AI_RECS__) ? window.__CINEVERSE_AI_RECS__ : []
  };

  function escapeHtml(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getWatchlistSet() {
    return new Set(Array.isArray(window.__CINEVERSE_MYLIST__) ? window.__CINEVERSE_MYLIST__ : []);
  }

  function buildRecCard(movie) {
    const saved = getWatchlistSet().has(movie.title);
    const truncated =
      movie.description && movie.description.length > 100
        ? `${escapeHtml(movie.description.slice(0, 100))}…`
        : escapeHtml(movie.description || 'No synopsis yet.');
    const scoreLabel = movie.aiScore ? Number(movie.aiScore).toFixed(2) : 'AI';
    return `
      <article class="ai-card" data-movie-card="${escapeHtml(movie.title)}" data-movie-card-hover="${escapeHtml(movie.title)}">
        <div class="ai-card__poster">
          <img src="${escapeHtml(movie.poster || movie.backdrop || 'https://placehold.co/320x480/111/eee?text=Poster')}" alt="${escapeHtml(movie.title)} poster">
          <span class="ai-card__score">${scoreLabel}</span>
        </div>
        <div class="ai-card__body">
          <p class="ai-card__reason"><i class="fa-solid fa-sparkles"></i> ${escapeHtml(movie.reason || 'Smart match for you')}</p>
          <h4>${escapeHtml(movie.title)}</h4>
          <p class="ai-card__meta">${escapeHtml(movie.platform || 'Featured')} • IMDb ${Number(movie.rating || 0).toFixed(1)}</p>
          <p>${truncated}</p>
          <button class="rail-card__save ${saved ? 'is-saved' : ''}" type="button" data-watchlist-btn="${escapeHtml(
            movie.title
          )}">
            <i class="fa-solid ${saved ? 'fa-check' : 'fa-bookmark'}"></i>
            <span>${saved ? 'Saved' : 'Watchlist'}</span>
          </button>
        </div>
      </article>
    `;
  }

  function renderRecGrid(list = []) {
    if (!recGrid) return;
    if (!list.length) {
      recGrid.innerHTML =
        '<p class="helper-text empty-state">Start saving a few titles or watch a trailer so Lumi can learn your taste.</p>';
      return;
    }
    recGrid.innerHTML = list.map(buildRecCard).join('');
  }

  async function refreshRecommendations() {
    if (!refreshBtn) return;
    refreshBtn.classList.add('is-loading');
    refreshBtn.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/ai/personalized', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Unable to refresh');
      const payload = await response.json();
      aiState.recs = Array.isArray(payload.recommendations) ? payload.recommendations : [];
      window.__CINEVERSE_AI_RECS__ = aiState.recs;
      renderRecGrid(aiState.recs);
    } catch (error) {
      refreshBtn.classList.add('has-error');
      setTimeout(() => refreshBtn.classList.remove('has-error'), 1200);
      console.error('AI refresh error:', error);
    } finally {
      refreshBtn.classList.remove('is-loading');
      refreshBtn.removeAttribute('aria-busy');
    }
  }

  if (refreshBtn && recGrid) {
    refreshBtn.addEventListener('click', refreshRecommendations);
  }

  const launcher = document.querySelector('[data-ai-launcher]');
  if (!launcher) {
    return;
  }

  const panel = launcher.querySelector('[data-ai-panel]');
  const toggleBtn = launcher.querySelector('[data-ai-toggle]');
  const closeBtn = launcher.querySelector('[data-ai-close]');
  const feed = launcher.querySelector('[data-ai-feed]');
  const emptyState = launcher.querySelector('[data-ai-empty]');
  const statusEl = launcher.querySelector('[data-ai-status]');
  const form = launcher.querySelector('[data-ai-form]');
  const input = launcher.querySelector('[data-ai-input]');
  const promptIdeas = [
    'a globe-trotting heist thriller',
    'a comforting feel-good rom-com',
    'an intense courtroom drama from the 90s',
    'a futuristic anime epic',
    'a short documentary about nature'
  ];

  let requestPending = false;
  let stopThinking = () => {};

  function togglePanel(force) {
    if (!panel) return;
    const shouldOpen = typeof force === 'boolean' ? force : !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', shouldOpen);
    launcher.classList.toggle('is-active', shouldOpen);
    toggleBtn?.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    if (shouldOpen) {
      const idea = promptIdeas[Math.floor(Math.random() * promptIdeas.length)];
      if (input && idea) input.placeholder = `e.g. ${idea}`;
      setTimeout(() => input?.focus(), 50);
    }
  }

  function setStatus(message) {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.classList.toggle('is-visible', Boolean(message));
  }

  function buildIntentSummary(intent = {}) {
    const descriptors = [];
    if (Array.isArray(intent.genres) && intent.genres.length) {
      descriptors.push(`${intent.genres[0]} stories`);
    }
    if (Array.isArray(intent.mood) && intent.mood.length) {
      descriptors.push(`${intent.mood[0]} vibes`);
    }
    if (intent.length === 'short') {
      descriptors.push('short runtimes');
    }
    if (intent.length === 'long') {
      descriptors.push('epic runtimes');
    }
    return descriptors.join(' with ');
  }

  function buildResultMessage(intent = {}, picks = []) {
    if (!picks.length) {
      return 'I could not find a perfect match, so here are some highly rated wildcards.';
    }
    const descriptor = buildIntentSummary(intent) || 'hand-picked titles';
    const opener = picks.length === 1 ? 'Here is' : 'Here are';
    const noun = picks.length === 1 ? 'a suggestion' : 'suggestions';
    return `${opener} ${picks.length === 1 ? 'a' : ''} ${descriptor} ${noun}. Hover or tap a card to see details.`;
  }

  function buildFollowUpsFromMovies(picks = [], intent = {}) {
    const prompts = [];
    picks.slice(0, 2).forEach(movie => {
      if (movie?.title) prompts.push(`More like ${movie.title}`);
    });
    if (Array.isArray(intent.genres) && intent.genres.length) {
      prompts.push(`Show me more ${intent.genres[0]} films`);
    }
    if (Array.isArray(intent.mood) && intent.mood.length) {
      prompts.push(`Find ${intent.mood[0]} comfort watches`);
    }
    prompts.push('Surprise me with something different');
    const unique = [];
    prompts.forEach(item => {
      if (item && !unique.includes(item)) unique.push(item);
    });
    return unique.slice(0, 3);
  }

  function createQuickReplies(followUps = []) {
    if (!followUps.length) return null;
    const bar = document.createElement('div');
    bar.className = 'ai-quick-replies';
    followUps.forEach(prompt => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.textContent = prompt;
      chip.addEventListener('click', () => handlePrompt(prompt));
      bar.appendChild(chip);
    });
    return bar;
  }

  function appendMessage(role, text, options = {}) {
    if (!feed) return;
    const { suggestions = [], followUps = [] } = options;
    const message = document.createElement('div');
    message.className = `ai-message ai-message--${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'ai-message__bubble';
    bubble.textContent = text;
    message.appendChild(bubble);
    if (role === 'assistant' && Array.isArray(suggestions) && suggestions.length) {
      const list = document.createElement('div');
      list.className = 'ai-message__suggestions';
      suggestions.forEach(suggestion => {
        list.appendChild(createSuggestionElement(suggestion));
      });
      message.appendChild(list);
    }
    if (role === 'assistant' && followUps.length) {
      const quickReplies = createQuickReplies(followUps);
      if (quickReplies) message.appendChild(quickReplies);
    }
    feed.appendChild(message);
    emptyState?.classList.add('is-hidden');
    feed.scrollTop = feed.scrollHeight;
  }

  function createSuggestionElement(suggestion) {
    const card = document.createElement('div');
    card.className = 'ai-suggestion';
    const poster = suggestion.poster || 'https://placehold.co/96x144/111/eee?text=Poster';
    card.innerHTML = `
      <img src="${escapeHtml(poster)}" alt="${escapeHtml(suggestion.title)} poster">
      <div class="ai-suggestion__body">
        <strong>${escapeHtml(suggestion.title)}</strong>
        <p>${escapeHtml(suggestion.reason || '')}</p>
        <span>${escapeHtml(suggestion.platform || 'Featured')} • IMDb ${Number(suggestion.rating || 0).toFixed(1)}</span>
      </div>
      <button type="button">
        <i class="fa-solid fa-play"></i>
        View
      </button>
    `;
    card.querySelector('button')?.addEventListener('click', () => {
      if (suggestion.title) {
        window.dispatchEvent(new CustomEvent('cineverse:openMovie', { detail: { title: suggestion.title } }));
      }
      togglePanel(false);
    });
    return card;
  }

  function buildWelcomeSuggestions() {
    if (!visibleMovies.length) return [];
    return visibleMovies.slice(0, 3).map(movie => ({
      title: movie.title,
      platform: movie.platform || 'Featured',
      rating: movie.rating || 0,
      poster: movie.poster || movie.backdrop,
      reason: 'Trending on your home rail'
    }));
  }

  function seedWelcome() {
    if (!feed || feed.querySelector('.ai-message')) return;
    const suggestions = buildWelcomeSuggestions();
    const followUps = ['Find something under 90 minutes', 'What fits a rainy night?', 'Pick a mind-bending thriller'];
    appendMessage(
      'assistant',
      "Hey, I'm Lumi. Describe the mood, genre, or pace you're after and I'll surface a handful of titles instantly.",
      { suggestions, followUps }
    );
  }

  function showThinking() {
    if (!feed) return () => {};
    const message = document.createElement('div');
    message.className = 'ai-message ai-message--assistant is-loading';
    const bubble = document.createElement('div');
    bubble.className = 'ai-message__bubble';
    bubble.innerHTML = '<span class="ai-typing"><span></span><span></span><span></span></span>';
    message.appendChild(bubble);
    feed.appendChild(message);
    emptyState?.classList.add('is-hidden');
    feed.scrollTop = feed.scrollHeight;
    return () => message.remove();
  }

  function handlePrompt(value) {
    if (!value) return;
    if (requestPending) {
      setStatus('One sec — finishing the previous search.');
      return;
    }
    appendMessage('user', value);
    if (input) input.value = '';
    sendPrompt(value);
  }

  async function sendPrompt(prompt) {
    if (!prompt || requestPending) return;
    requestPending = true;
    setStatus('Analyzing your taste...');
    stopThinking = showThinking();
    try {
      const response = await fetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) throw new Error('Unable to chat right now');
      const payload = await response.json();
      if (payload.mode === 'general' && payload.general) {
        const general = payload.general;
        appendMessage('assistant', general.message || 'Let me know what you want to watch next.', {
          followUps: general.followUps || [],
          suggestions: general.suggestions || []
        });
        return;
      }
      const intent = payload.intent || {};
      const picks = Array.isArray(payload.suggestions) ? payload.suggestions : [];
      const summary = buildResultMessage(intent, picks);
      const followUps = buildFollowUpsFromMovies(picks, intent);
      appendMessage('assistant', summary, { suggestions: picks, followUps });
    } catch (error) {
      console.error('AI chat error:', error);
      appendMessage('assistant', 'I hit a snag while searching. Please tweak your prompt and try again.');
    } finally {
      requestPending = false;
      setStatus('');
      stopThinking();
      stopThinking = () => {};
    }
  }

  toggleBtn?.addEventListener('click', () => togglePanel());
  closeBtn?.addEventListener('click', () => togglePanel(false));

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const value = input?.value?.trim();
    if (!value) return;
    handlePrompt(value);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel?.classList.contains('is-open')) {
      togglePanel(false);
    }
  });

  document.addEventListener('keydown', event => {
    const target = event.target;
    const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (isTyping && panel?.classList.contains('is-open')) return;
      togglePanel(true);
      setTimeout(() => input?.focus(), 30);
    }
  });

  document.addEventListener('click', event => {
    if (!panel?.classList.contains('is-open')) return;
    const target = event.target;
    if (panel.contains(target) || toggleBtn?.contains(target)) return;
    togglePanel(false);
  });

  seedWelcome();
})();
