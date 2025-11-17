(function () {
  const storageKey = 'cineverse-movie-cache';
  const cachedPayload = localStorage.getItem(storageKey);

  if (!cachedPayload && window.__CINEVERSE_MOVIES__) {
    localStorage.setItem(storageKey, JSON.stringify({
      updatedAt: Date.now(),
      data: window.__CINEVERSE_MOVIES__
    }));
  }

  function updateCache(title, payload) {
    const snapshot = JSON.parse(localStorage.getItem(storageKey) || '{"data": {}}');
    snapshot.updatedAt = Date.now();
    snapshot.data = snapshot.data || {};
    if (payload) {
      snapshot.data[title] = payload;
    } else {
      delete snapshot.data[title];
    }
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  }

  function createToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  if (window.io) {
    const socket = window.__CINEVERSE_SOCKET__ || (window.__CINEVERSE_SOCKET__ = window.io());

    socket.on('movie:created', movie => {
      updateCache(movie.title, movie);
      createToast(`${movie.title} added to catalog`);
    });

    socket.on('movie:updated', movie => {
      updateCache(movie.title, movie);
      createToast(`${movie.title} updated`);
    });

    socket.on('movie:deleted', movie => {
      updateCache(movie.title);
      createToast(`${movie.title} removed`);
    });
  }
})();
