const dashboardRoot = document.querySelector('[data-dashboard-root]');

if (dashboardRoot) {
  const authMetricsEl = document.getElementById('auth-metrics');
  const overviewEl = document.getElementById('catalog-overview');
  const audienceEl = document.getElementById('audience-panel');
  const securityEl = document.getElementById('security-panel');
  const totalMoviesEl = document.getElementById('total-movies');
  const avgRatingEl = document.getElementById('avg-rating');
  const userCountEl = document.getElementById('user-count');
  const genreCountEl = document.getElementById('genre-count');
  const genreListEl = document.getElementById('genre-list');
  const refreshBtn = document.getElementById('refresh-dashboard');
  const chartUpdatedEl = document.getElementById('chart-updated');
  const throughputCanvas = document.getElementById('throughput-chart');
  const dbHealthCanvas = document.getElementById('db-health-chart');
  const dbHealthLegend = document.getElementById('db-health-legend');
  const genreLegend = document.getElementById('genre-legend');
  const genreColors = ['#38bdf8', '#f472b6', '#34d399', '#facc15', '#c084fc', '#f87171'];

  const CACHE_KEY = 'cineverse-dashboard-cache';
  const CACHE_TTL = 1000 * 20;
  let cachedPayload;
  try {
    cachedPayload = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  } catch (error) {
    cachedPayload = null;
  }
  let latestPayload = cachedPayload && Date.now() - (cachedPayload.updatedAt || 0) < CACHE_TTL
    ? cachedPayload.data
    : null;
  let throughputChart;
  let dbHealthChart;

  const statusBadge = (status = 'unknown') => {
    const palette = {
      online: 'text-green-300 border-green-500/40 bg-green-500/10',
      offline: 'text-gray-300 border-gray-500/40 bg-gray-500/10',
      error: 'text-red-300 border-red-500/40 bg-red-500/10',
      disabled: 'text-yellow-300 border-yellow-500/40 bg-yellow-500/10'
    };
    return `<span class="px-2 py-1 rounded-full border text-xs uppercase tracking-wide ${palette[status] || palette.offline}">${status}</span>`;
  };

  function registerGlowPlugin() {
    if (window.Chart && !window.Chart._cineGlowRegistered) {
      const glowPlugin = {
        id: 'cineGlow',
        beforeDatasetsDraw(chart) {
          const ctx = chart.ctx;
          ctx.save();
          ctx.shadowColor = 'rgba(56, 189, 248, 0.35)';
          ctx.shadowBlur = 18;
          ctx.shadowOffsetY = 10;
        },
        afterDatasetsDraw(chart) {
          chart.ctx.restore();
        }
      };
      window.Chart.register(glowPlugin);
      window.Chart._cineGlowRegistered = true;
    }
  }

  function bootstrapCharts() {
    registerGlowPlugin();
    if (window.Chart && throughputCanvas && !throughputChart) {
      throughputChart = new Chart(throughputCanvas, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Catalog size',
              data: [],
              borderColor: 'rgba(56,189,248,0.9)',
              backgroundColor: 'rgba(56,189,248,0.2)',
              tension: 0.35,
              fill: true,
              borderWidth: 3
            },
            {
              label: 'Active cinephiles',
              data: [],
              borderColor: 'rgba(236,72,153,0.9)',
              backgroundColor: 'rgba(236,72,153,0.15)',
              tension: 0.35,
              fill: true,
              borderWidth: 3
            },
            {
              label: 'Avg. rating x10',
              data: [],
              borderColor: 'rgba(52,211,153,0.9)',
              backgroundColor: 'rgba(52,211,153,0.15)',
              tension: 0.35,
              fill: true,
              borderWidth: 3
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#e5e7eb' } },
            cineGlow: {}
          },
          scales: {
            x: { ticks: { color: '#94a3b8' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }
    if (window.Chart && dbHealthCanvas && !dbHealthChart) {
      dbHealthChart = new Chart(dbHealthCanvas, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: ['#34d399', '#60a5fa', '#f472b6', '#f87171', '#facc15']
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(15,23,42,0.95)',
              titleColor: '#e2e8f0',
              bodyColor: '#cbd5f5',
              callbacks: {
                label: ctx => `${ctx.label}: ${ctx.parsed} titles`
              }
            }
          },
          cutout: '76%',
          borderRadius: 10,
          spacing: 4
        }
      });
    }
  }

  function updateCharts(data) {
    bootstrapCharts();
    if (!throughputChart || !dbHealthChart) return;

    const ctx = throughputCanvas.getContext('2d');
    const gradBlue = ctx.createLinearGradient(0, 0, 0, throughputCanvas.height);
    gradBlue.addColorStop(0, 'rgba(56,189,248,0.45)');
    gradBlue.addColorStop(1, 'rgba(56,189,248,0)');
    const gradPink = ctx.createLinearGradient(0, 0, 0, throughputCanvas.height);
    gradPink.addColorStop(0, 'rgba(236,72,153,0.45)');
    gradPink.addColorStop(1, 'rgba(236,72,153,0)');
    const gradGreen = ctx.createLinearGradient(0, 0, 0, throughputCanvas.height);
    gradGreen.addColorStop(0, 'rgba(52,211,153,0.45)');
    gradGreen.addColorStop(1, 'rgba(52,211,153,0)');

    const timeline = data.movieMetrics?.timeline || { labels: [], data: [] };
    const safeLabels = timeline.labels?.length ? timeline.labels : ['T-3', 'T-2', 'T-1', 'Now'];
    const safeData = timeline.data?.length ? timeline.data : [5, 7, 6, 8];
    throughputChart.data.labels = safeLabels;
    throughputChart.data.datasets[0].data = safeData;
    throughputChart.data.datasets[0].backgroundColor = gradBlue;
    throughputChart.data.datasets[1].data = safeData.map(value => Math.round(value * 0.65));
    throughputChart.data.datasets[1].backgroundColor = gradPink;
    throughputChart.data.datasets[2].data = safeData.map(value => Math.max(1, Math.round(value * (data.movieMetrics.averageRating / 10))));
    throughputChart.data.datasets[2].backgroundColor = gradGreen;
    throughputChart.update();
    chartUpdatedEl && (chartUpdatedEl.textContent = `Updated ${new Date().toLocaleTimeString()}`);

    const topGenres = data.movieMetrics?.topGenres || [];
    const fallbackLabels = ['Drama', 'Action', 'Documentary', 'Sci-Fi'];
    const genreLabels = topGenres.length ? topGenres.map(item => item.genre) : fallbackLabels;
    const genreData = topGenres.length ? topGenres.map(item => item.count) : [5, 3, 2, 1];
    const colors = genreColors.slice(0, genreLabels.length);
    dbHealthChart.data.labels = genreLabels;
    dbHealthChart.data.datasets[0].data = genreData;
    dbHealthChart.data.datasets[0].backgroundColor = colors;
    dbHealthChart.update();
    if (dbHealthLegend) {
      dbHealthLegend.innerHTML = genreLabels.map((label, idx) => `
        <li class="flex items-center justify-between">
          <span>${label}</span>
          <span>${genreData[idx]} titles</span>
        </li>
      `).join('');
    }
    if (genreLegend) {
      genreLegend.innerHTML = genreLabels.map((label, idx) => `
        <li class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded-full" style="background:${colors[idx]}"></span>
          <span>${label}</span>
        </li>
      `).join('');
    }
  }

  function renderUI(data = {}) {
    if (!data.movieMetrics) return;
    totalMoviesEl.textContent = data.movieMetrics.totalMovies;
    avgRatingEl.textContent = data.movieMetrics.averageRating;
    userCountEl.textContent = data.movieMetrics.userCount;
    const genreEntries = Object.entries(data.movieMetrics.genres || {});
    genreCountEl.textContent = genreEntries.length;
    genreListEl.innerHTML = genreEntries
      .map(([genre, count]) => `<span class="px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700">${genre}: ${count}</span>`)
      .join('');

    const infraCards = [
      {
        title: 'MongoDB Atlas',
        status: data.nosql?.mongo?.status || 'unknown',
        body: data.nosql?.mongo?.stats
          ? `${data.nosql.mongo.stats.collections} collections • profiles & auth`
          : 'Identity + login state'
      },
      {
        title: 'PostgreSQL Catalog',
        status: data.relational?.postgres?.status || 'unknown',
        body: data.relational?.postgres?.timestamp
          ? `Heartbeat ${new Date(data.relational.postgres.timestamp).toLocaleTimeString()}`
          : data.relational?.postgres?.error || 'Film metadata source'
      },
      {
        title: 'Redis Stream',
        status: data.nosql?.redis?.status || 'offline',
        body: data.nosql?.redis?.status === 'online' ? 'Cache + realtime fan-out' : (data.nosql?.redis?.error || 'Caching layer offline')
      },
      {
        title: 'Socket Layer',
        status: 'online',
        body: 'Live dashboard + catalog events'
      }
    ];

    authMetricsEl.innerHTML = infraCards
      .map(item => `
        <article class="p-4 bg-gray-900/60 rounded-2xl border border-gray-800">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold">${item.title}</h3>
            ${statusBadge(item.status)}
          </div>
          <p class="text-gray-400 text-sm">${item.body}</p>
        </article>
      `)
      .join('');

    if (overviewEl) {
      overviewEl.innerHTML = `
        <article class="p-4 rounded-xl border border-gray-800 bg-gray-950/60">
          <p class="text-xs uppercase tracking-wide text-gray-400">Total titles</p>
          <p class="text-3xl font-black mt-1">${data.movieMetrics.totalMovies}</p>
        </article>
        <article class="p-4 rounded-xl border border-gray-800 bg-gray-950/60">
          <p class="text-xs uppercase tracking-wide text-gray-400">Registered users</p>
          <p class="text-3xl font-black mt-1">${data.movieMetrics.userCount}</p>
        </article>
        <article class="p-4 rounded-xl border border-gray-800 bg-gray-950/60">
          <p class="text-xs uppercase tracking-wide text-gray-400">Tracked genres</p>
          <p class="text-3xl font-black mt-1">${Object.keys(data.movieMetrics.genres || {}).length}</p>
        </article>
        <article class="p-4 rounded-xl border border-gray-800 bg-gray-950/60">
          <p class="text-xs uppercase tracking-wide text-gray-400">Avg. rating</p>
          <p class="text-3xl font-black mt-1">${data.movieMetrics.averageRating}</p>
        </article>
      `;
    }

    if (audienceEl) {
      const topGenres = (data.movieMetrics.topGenres || [])
        .map(item => `<li class="flex justify-between"><span>${item.genre}</span><span>${item.count} titles</span></li>`)
        .join('');
      audienceEl.innerHTML = `
        <p class="text-sm text-gray-400 mb-2">Top audience moods</p>
        <ul class="space-y-2 text-sm text-gray-200">${topGenres || '<li>No genres tracked</li>'}</ul>
        <div class="mt-4 rounded-xl border border-gray-800 bg-gray-950/40 p-3 text-xs text-gray-400">
          <p class="uppercase tracking-wide text-white/60 mb-1">Catalog heartbeat</p>
          <p><strong>PostgreSQL:</strong> ${infraCards[1].body}</p>
          <p><strong>MongoDB:</strong> ${infraCards[0].status}</p>
        </div>
      `;
    }

    securityEl.innerHTML = `
      <p class="text-gray-300 text-sm"><strong>MD5 sample:</strong> ${data.security?.md5 || 'n/a'}</p>
      <p class="text-gray-300 text-sm"><strong>SHA-256 sample:</strong> ${data.security?.sha256 || 'n/a'}</p>
      <p class="text-gray-300 text-sm"><strong>TLS enabled:</strong> ${data.security?.tlsEnabled ? 'Yes' : 'No'}</p>
      <p class="text-gray-500 text-xs">${data.security?.httpsRecommendation || ''}</p>
    `;

    updateCharts(data);
  }

  function persistDashboardCache(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ updatedAt: Date.now(), data: payload }));
    } catch (error) {
      /* ignore quota errors */
    }
  }

  async function fetchMetrics(force = false) {
    try {
      if (force) {
        localStorage.removeItem(CACHE_KEY);
      }
      const response = await fetch('/dashboard/metrics');
      const data = await response.json();
      latestPayload = data;
      persistDashboardCache(data);
      renderUI(data);
    } catch (error) {
      console.error('Unable to load dashboard metrics', error);
    }
  }

  if (latestPayload && latestPayload.movieMetrics) {
    renderUI(latestPayload);
  } else {
    fetchMetrics();
  }

  refreshBtn?.addEventListener('click', () => fetchMetrics(true));

  if (window.io) {
    const socket = window.__CINEVERSE_SOCKET__ || (window.__CINEVERSE_SOCKET__ = window.io());
    socket.on('dashboard:metrics', data => {
      latestPayload = data;
      persistDashboardCache(data);
      renderUI(data);
    });
  }
}
