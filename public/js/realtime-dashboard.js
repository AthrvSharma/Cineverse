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
  const genreColors = ['#5be7ff', '#ff7f50', '#7c82ff', '#5df2b3', '#ffc857', '#ff4d4f'];
  const axisColor = '#93a0c7';
  const legendColor = '#d1d8ff';

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
      online: 'var(--green)',
      offline: 'var(--text-soft)',
      error: 'var(--accent)',
      disabled: 'var(--yellow)',
      unknown: 'var(--text-muted)'
    };
    const color = palette[status] || palette.unknown;
    return `<span class="badge" style="background:${color};color:#fff;">${status}</span>`;
  };

  function registerGlowPlugin() {
    if (window.Chart && !window.Chart._cineGlowRegistered) {
      const glowPlugin = {
        id: 'cineGlow',
        beforeDatasetsDraw(chart) {
          const ctx = chart.ctx;
          ctx.save();
          ctx.shadowColor = 'rgba(91, 231, 255, 0.25)';
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
              borderColor: '#5be7ff',
              backgroundColor: 'rgba(91,231,255,0.2)',
              tension: 0.35,
              fill: true,
              borderWidth: 3
            },
            {
              label: 'Active cinephiles',
              data: [],
              borderColor: '#ff7f50',
              backgroundColor: 'rgba(255,127,80,0.15)',
              tension: 0.35,
              fill: true,
              borderWidth: 3
            },
            {
              label: 'Avg. rating x10',
              data: [],
              borderColor: '#7c82ff',
              backgroundColor: 'rgba(124,130,255,0.15)',
              tension: 0.35,
              fill: true,
              borderWidth: 3
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: legendColor } },
            cineGlow: {}
          },
          scales: {
            x: { ticks: { color: axisColor }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: axisColor }, grid: { color: 'rgba(255,255,255,0.06)' } }
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
            backgroundColor: ['#5df2b3', '#5be7ff', '#ff7f50', '#7c82ff', '#ffc857']
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(4,8,25,0.95)',
              titleColor: '#f5f7ff',
              bodyColor: '#cdd5ff',
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
    gradBlue.addColorStop(0, 'rgba(91,231,255,0.45)');
    gradBlue.addColorStop(1, 'rgba(91,231,255,0)');
    const gradOrange = ctx.createLinearGradient(0, 0, 0, throughputCanvas.height);
    gradOrange.addColorStop(0, 'rgba(255,127,80,0.45)');
    gradOrange.addColorStop(1, 'rgba(255,127,80,0)');
    const gradIndigo = ctx.createLinearGradient(0, 0, 0, throughputCanvas.height);
    gradIndigo.addColorStop(0, 'rgba(124,130,255,0.45)');
    gradIndigo.addColorStop(1, 'rgba(124,130,255,0)');

    const timeline = data.movieMetrics?.timeline || { labels: [], data: [] };
    const safeLabels = timeline.labels?.length ? timeline.labels : ['T-3', 'T-2', 'T-1', 'Now'];
    const safeData = timeline.data?.length ? timeline.data : [5, 7, 6, 8];
    throughputChart.data.labels = safeLabels;
    throughputChart.data.datasets[0].data = safeData;
    throughputChart.data.datasets[0].backgroundColor = gradBlue;
    throughputChart.data.datasets[1].data = safeData.map(value => Math.round(value * 0.65));
    throughputChart.data.datasets[1].backgroundColor = gradOrange;
    throughputChart.data.datasets[2].data = safeData.map(value => Math.max(1, Math.round(value * (data.movieMetrics.averageRating / 10))));
    throughputChart.data.datasets[2].backgroundColor = gradIndigo;
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
        <li style="display:flex; justify-content:space-between;">
          <span>${label}</span>
          <span>${genreData[idx]} titles</span>
        </li>
      `).join('');
    }
    if (genreLegend) {
      genreLegend.innerHTML = genreLabels.map((label, idx) => `
        <li style="display:flex; align-items:center; gap:0.5rem;">
          <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${colors[idx]};"></span>
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
      .map(([genre, count]) => `<span class="tag">${genre}: ${count}</span>`)
      .join('');

    const atlasStatus = data.nosql?.mongo?.status || 'unknown';
    const infraCards = [
      {
        title: 'MongoDB Atlas (users)',
        status: atlasStatus,
        body: data.nosql?.mongo?.stats
          ? `${data.nosql.mongo.stats.collections} collections • users & auth`
          : data.nosql?.mongo?.error || 'Identity + login state'
      },
      {
        title: 'MongoDB Atlas (catalog)',
        status: atlasStatus,
        body: `${data.movieMetrics?.totalMovies || 0} titles • movies collection`
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
        <article class="card status-card" data-status="${item.status}">
          <div class="section-header" style="margin-bottom:0.5rem;">
            <h3 style="margin:0;">${item.title}</h3>
            ${statusBadge(item.status)}
          </div>
          <p class="helper-text">${item.body}</p>
        </article>
      `)
      .join('');

    if (overviewEl) {
      overviewEl.innerHTML = `
        <h3 style="margin-top:0;">Catalog snapshots</h3>
        <div class="stat-grid" style="margin-top:1rem;">
          <article class="stat-card">
            <span>Total titles</span>
            <strong>${data.movieMetrics.totalMovies}</strong>
          </article>
          <article class="stat-card">
            <span>Registered users</span>
            <strong>${data.movieMetrics.userCount}</strong>
          </article>
          <article class="stat-card">
            <span>Tracked genres</span>
            <strong>${Object.keys(data.movieMetrics.genres || {}).length}</strong>
          </article>
          <article class="stat-card">
            <span>Average rating</span>
            <strong>${data.movieMetrics.averageRating}</strong>
          </article>
        </div>
      `;
    }

    if (audienceEl) {
      const topGenres = (data.movieMetrics.topGenres || [])
        .map(item => `<li style="display:flex; justify-content:space-between;"><span>${item.genre}</span><span>${item.count} titles</span></li>`)
        .join('');
      audienceEl.innerHTML = `
        <p><strong>Top genres</strong></p>
        <ul style="list-style:none; padding:0; margin:0.5rem 0;">${topGenres || '<li>No genres tracked</li>'}</ul>
        <div class="helper-text" style="margin-top:1rem;">
          <p><strong>Catalog DB:</strong> ${infraCards[1].body}</p>
          <p><strong>Atlas status:</strong> ${infraCards[0].status}</p>
        </div>
      `;
    }

    securityEl.innerHTML = `
      <p><strong>MD5 sample:</strong> ${data.security?.md5 || 'n/a'}</p>
      <p><strong>SHA-256 sample:</strong> ${data.security?.sha256 || 'n/a'}</p>
      <p><strong>TLS enabled:</strong> ${data.security?.tlsEnabled ? 'Yes' : 'No'}</p>
      <p>${data.security?.httpsRecommendation || ''}</p>
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
