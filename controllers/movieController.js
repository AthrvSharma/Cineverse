const movieStore = require('../models/Movie');
const User = require('../models/User');
const {
  getCachedMovies,
  setCachedMovies,
  invalidateMovieCache
} = require('../services/redisCache');
const eventBus = require('../sockets/eventBus');
const { gatherNoSqlInsights } = require('../services/nosqlService');
const { getPostgresStatus } = require('../services/relationalService');

function mapMovies(movieRows = []) {
  return movieRows.map(m => ({
    _id: String(m.id),
    id: m.id,
    title: m.title,
    poster: m.poster,
    backdrop: m.backdrop,
    genres: m.genres || [],
    description: m.description,
    year: m.year,
    director: m.director,
    cast: m.cast || [],
    rating: Number(m.rating || 0),
    runtime: m.runtime,
    trailerUrl: m.trailerUrl || ''
  }));
}

function summarize(text = '', length = 180) {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

function buildSpotlightsFromMovies(movies = []) {
  if (!movies.length) {
    return [
      {
        id: 'placeholder-spotlight',
        title: 'Populate your catalog to unlock live spotlights',
        presenter: 'PostgreSQL pipeline',
        focusLabel: 'Curation flow',
        moodLabel: 'Awaiting data',
        summary: 'Add a few films and Cineverse will automatically craft spotlight rails directly from the PostgreSQL dataset.',
        accentColor: '#38bdf8',
        detail: 'Real-time once movies exist'
      }
    ];
  }

  const accentPalette = ['#38bdf8', '#c084fc', '#34d399', '#f87171'];
  const moodLabels = ['Midnight queue', 'Golden hour', 'Dreamscape', 'High velocity'];

  return [...movies]
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 4)
    .map((movie, index) => ({
      id: movie.id,
      title: movie.title,
      presenter: movie.director || 'Unknown director',
      focusLabel: (movie.genres || [])[0] || 'Cinema',
      moodLabel: moodLabels[index % moodLabels.length],
      summary: summarize(movie.description || ''),
      accentColor: accentPalette[index % accentPalette.length],
      detail: `${movie.year || 'Year TBD'} • ${movie.runtime || 'Runtime TBD'}`
    }));
}

function buildVirtualRoomsFromMovies(movies = []) {
  if (!movies.length) {
    return [
      {
        id: 'placeholder-room',
        room: 'Curation Lab',
        film: 'Awaiting catalog seed',
        host: 'Cineverse Studio',
        theme: 'Populate PostgreSQL to auto-build programming',
        capacity: 50,
        registered: 12,
        timezone: 'Local time',
        vibe: 'Simulated session will appear here',
        signalColor: '#38bdf8',
        startLabel: 'Soon',
        startTimeLabel: ''
      }
    ];
  }

  const rooms = ['Spectrum Loft', 'Aurora Bay', 'Echo Observatory', 'Parallel Studio'];
  const palette = ['#38bdf8', '#f472b6', '#facc15', '#34d399'];
  const now = Date.now();

  return movies.slice(0, 4).map((movie, index) => {
    const startTime = new Date(now + (index + 1) * 1000 * 60 * 60 * 6);
    const capacity = 40 + index * 12;
    const registered = Math.min(
      capacity - 4,
      Math.max(8, Math.round(capacity * (0.45 + Number(movie.rating || 6) / 30)))
    );
    return {
      id: movie.id,
      room: rooms[index % rooms.length],
      film: movie.title,
      host: movie.director || 'Guest host',
      theme: (movie.genres || []).slice(0, 2).join(' • ') || 'Genre lab',
      capacity,
      registered,
      timezone: 'Local',
      vibe: `${movie.year || 'Year TBD'} • ${movie.runtime || 'Runtime TBD'}`,
      signalColor: palette[index % palette.length],
      startLabel: startTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      startTimeLabel: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  });
}

async function fetchMovies() {
  const cached = await getCachedMovies();
  if (cached?.length) {
    return cached;
  }

  const rows = await movieStore.findAllMovies();
  const movies = mapMovies(rows);
  await setCachedMovies(movies);
  return movies;
}

async function renderLandingPage(req, res) {
  try {
    const movies = await fetchMovies();
    const movieObject = movies.reduce((acc, m) => {
      acc[m.title] = m;
      return acc;
    }, {});

    if (!req.user || !req.user.isAdmin) {
      return res.render('index-user', {
        movies: movieObject,
        user: req.user
      });
    }

    const [nosql, postgresStatus] = await Promise.all([
      gatherNoSqlInsights(),
      getPostgresStatus()
    ]);

    const dbStatus = [
      {
        key: 'mongo',
        name: 'MongoDB Atlas',
        role: 'Identity + login state',
        status: nosql.mongo?.status || 'unknown',
        detail: nosql.mongo?.stats ? `${nosql.mongo.stats.collections} collections live` : 'Awaiting stats'
      },
      {
        key: 'postgres',
        name: 'PostgreSQL Catalog',
        role: 'Film metadata + rails',
        status: postgresStatus.status || 'unknown',
        detail: postgresStatus.timestamp ? `Heartbeat ${new Date(postgresStatus.timestamp).toLocaleTimeString()}` : postgresStatus.error || 'Pending'
      },
      {
        key: 'redis',
        name: 'Redis Stream',
        role: 'Realtime cache + fanout',
        status: nosql.redis?.status || 'offline',
        detail: nosql.redis?.status === 'online' ? 'Cache hot' : (nosql.redis?.error || 'Disabled')
      }
    ];

    const catalogSpotlights = buildSpotlightsFromMovies(movies);
    const virtualRooms = buildVirtualRoomsFromMovies(movies);

    res.render('index', {
      movies: movieObject,
      user: req.user,
      catalogSpotlights,
      virtualRooms,
      dbStatus
    });
  } catch (error) {
    console.error('Error building landing page:', error);
    req.flash('error_msg', 'Unable to load movies');
    const template = req.user && req.user.isAdmin ? 'index' : 'index-user';
    const payload = {
      movies: {},
      user: req.user
    };
    if (template === 'index') {
      Object.assign(payload, { catalogSpotlights: [], virtualRooms: [], dbStatus: [] });
    }
    res.render(template, payload);
  }
}

async function createMovie(payload) {
  const movie = await movieStore.createMovie(payload);
  const mapped = mapMovies([movie])[0];
  await invalidateMovieCache();
  eventBus.emit('movie:created', mapped);
  return mapped;
}

async function updateMovie(id, payload) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('Invalid movie id');
  }
  const updatedRow = await movieStore.updateMovie(numericId, payload);
  await invalidateMovieCache();
  const mapped = updatedRow ? mapMovies([updatedRow])[0] : null;
  if (mapped) {
    eventBus.emit('movie:updated', mapped);
  }
  return mapped;
}

async function deleteMovie(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error('Invalid movie id');
  }
  const deletedRow = await movieStore.deleteMovie(numericId);
  await invalidateMovieCache();
  if (deletedRow) {
    eventBus.emit('movie:deleted', { _id: String(deletedRow.id), title: deletedRow.title });
  }
  return deletedRow;
}

async function getMovieAnalytics() {
  const movies = await fetchMovies();
  const byGenre = movies.reduce((acc, movie) => {
    movie.genres.forEach(genre => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {});

  const averageRating =
    movies.reduce((sum, movie) => sum + Number(movie.rating || 0), 0) /
    Math.max(movies.length, 1);

  const userCount = await User.countDocuments();

  const moviesByYear = movies.reduce((acc, movie) => {
    const year = Number(movie.year);
    if (!year || Number.isNaN(year)) return acc;
    if (!acc[year]) acc[year] = 0;
    acc[year] += 1;
    return acc;
  }, {});
  const currentYear = new Date().getFullYear();
  const timelineLabels = [];
  const timelineData = [];
  for (let offset = 6; offset >= 0; offset--) {
    const year = currentYear - offset;
    timelineLabels.push(String(year));
    timelineData.push(moviesByYear[year] || 0);
  }
  const ratingBuckets = [
    { label: '9-10', min: 9, max: 10 },
    { label: '8-9', min: 8, max: 9 },
    { label: '7-8', min: 7, max: 8 },
    { label: '6-7', min: 6, max: 7 },
    { label: '<6', min: 0, max: 6 }
  ];
  const ratingCounts = ratingBuckets.map(bucket => {
    return movies.filter(movie => {
      const rating = Number(movie.rating || 0);
      if (bucket.label === '<6') return rating < bucket.max;
      return rating >= bucket.min && rating < bucket.max;
    }).length;
  });
  const topGenres = Object.entries(byGenre)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }));

  return {
    totalMovies: movies.length,
    genres: byGenre,
    averageRating: Number(averageRating.toFixed(2)),
    userCount,
    timeline: {
      labels: timelineLabels,
      data: timelineData
    },
    ratings: {
      labels: ratingBuckets.map(bucket => bucket.label),
      data: ratingCounts
    },
    topGenres
  };
}

module.exports = {
  renderLandingPage,
  createMovie,
  updateMovie,
  deleteMovie,
  fetchMovies,
  getMovieAnalytics
};
