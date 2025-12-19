const { Types } = require('mongoose');
const movieStore = require('../models/Movie');
const User = require('../models/User');
const {
  getCachedMovies,
  setCachedMovies,
  invalidateMovieCache
} = require('../services/redisCache');
const eventBus = require('../sockets/eventBus');
const { PLAN_CONFIG } = require('../config/plans');
const { getPersonalizedRecommendations } = require('../services/aiRecommender');

function mapMovies(movieRows = []) {
  return movieRows.map(m => {
    const id = m._id ? String(m._id) : m.id !== undefined ? String(m.id) : '';
    return {
      _id: id,
      id,
      title: m.title,
      poster: m.poster,
      backdrop: m.backdrop,
      genres: m.genres || [],
      platform: m.platform || 'Featured',
      description: m.description,
      year: m.year,
      director: m.director,
      cast: m.cast || [],
      rating: Number(m.rating || 0),
      runtime: m.runtime,
      trailerUrl: m.trailerUrl || ''
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

function normalizePlatformName(name = '') {
  return (name || '').toString().trim().toLowerCase();
}

function scopeMoviesForUser(user, movies = []) {
  const planInfo = user && user.subscriptionPlan ? PLAN_CONFIG[user.subscriptionPlan] : null;
  const planPlatforms = user && !user.isAdmin ? (planInfo ? planInfo.platforms : []) : [];
  const allowedSlugs = planPlatforms.map(normalizePlatformName);
  const allowedSet = allowedSlugs.length && user && !user.isAdmin ? new Set(allowedSlugs) : null;
  const scopedMovies =
    allowedSet instanceof Set
      ? movies.filter(movie => allowedSet.has(normalizePlatformName(movie.platform || 'Featured')))
      : movies;
  return { planInfo, planPlatforms, allowedSlugs, allowedSet, scopedMovies };
}

async function renderLandingPage(req, res) {
  try {
    const movies = await fetchMovies();
    const user = req.user;
    const { planInfo, planPlatforms, allowedSlugs, allowedSet, scopedMovies } = scopeMoviesForUser(user, movies);
    const movieObject = scopedMovies.reduce((acc, m) => {
      acc[m.title] = m;
      return acc;
    }, {});
    let platforms = Array.from(new Set(scopedMovies.map(m => (m.platform || 'Featured')))).sort((a, b) =>
      a.localeCompare(b)
    );
    if (!platforms.length && planPlatforms.length) {
      platforms = planPlatforms;
    }
    const requestedSlug = normalizePlatformName(req.params.platform);
    if (
      req.params.platform &&
      user &&
      !user.isAdmin &&
      allowedSet instanceof Set &&
      requestedSlug &&
      !allowedSet.has(requestedSlug)
    ) {
      req.flash('error_msg', 'That platform is not part of your bundle. Upgrade your plan to unlock it.');
      return res.redirect('/');
    }
    const matchedPlatform = platforms.find(name => normalizePlatformName(name) === requestedSlug);
    const filteredByPlatform = matchedPlatform
      ? scopedMovies.filter(movie => normalizePlatformName(movie.platform || 'Featured') === requestedSlug)
      : [];
    const curatedAll = [...scopedMovies].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    const initialPlatformSet = (matchedPlatform ? filteredByPlatform : curatedAll).slice(0, 12);
    const platformMovies = initialPlatformSet.length ? initialPlatformSet : [];
    const heroVisibleMovies = platformMovies.length ? platformMovies : curatedAll.slice(0, 8);
    const currentYear = new Date().getFullYear();
    const sliceByGenre = keyword =>
      curatedAll.filter(movie =>
        (movie.genres || []).some(genre => genre.toLowerCase().includes(keyword))
      );
    const freshDrops = curatedAll
      .filter(movie => Number(movie.year) >= currentYear - 1)
      .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
    const sections = {
      actionPacked: sliceByGenre('action').slice(0, 12),
      sciFiFrontier: sliceByGenre('sci').slice(0, 12),
      freshDrops: freshDrops.slice(0, 12),
      dramaClassics: sliceByGenre('drama')
        .filter(movie => Number(movie.rating || 0) >= 8)
        .slice(0, 12),
      awardBuzz: curatedAll.filter(movie => Number(movie.rating || 0) >= 8.5).slice(0, 12)
    };
    const activePlatform = matchedPlatform ? requestedSlug : '';
    const platformLabel = matchedPlatform || 'All Platforms';
    const averageRating =
      (matchedPlatform ? filteredByPlatform : scopedMovies).reduce(
        (sum, movie) => sum + Number(movie.rating || 0),
        0
      ) / Math.max((matchedPlatform ? filteredByPlatform : scopedMovies).length, 1);
    const stats = {
      totalMovies: scopedMovies.length,
      platformCount: platforms.length,
      visibleTitles: heroVisibleMovies.length,
      averageRating: Number.isFinite(averageRating) ? averageRating.toFixed(1) : '0.0'
    };
    const template = user && user.isAdmin ? 'index' : 'index-user';
    let aiRecommendations = [];
    try {
      if (!user?.isAdmin) {
        aiRecommendations = await getPersonalizedRecommendations({
          user,
          movies: scopedMovies,
          limit: 8
        });
      }
    } catch (error) {
      console.error('AI recommendation error:', error);
      aiRecommendations = [];
    }
    res.render(template, {
      movies: movieObject,
      platformMovies,
      platformLabel,
      visibleMovies: heroVisibleMovies,
      user,
      planInfo,
      platforms,
      activePlatform,
      stats,
      allowedPlatforms: user && !user.isAdmin ? (planPlatforms.length ? planPlatforms : platforms) : platforms,
      allowedPlatformSlugs: user && !user.isAdmin
        ? (allowedSlugs.length ? allowedSlugs : platforms.map(normalizePlatformName))
        : platforms.map(normalizePlatformName),
      sections,
      aiRecommendations
    });
  } catch (error) {
    console.error('Error building landing page:', error);
    req.flash('error_msg', 'Unable to load movies');
    const template = req.user && req.user.isAdmin ? 'index' : 'index-user';
    res.render(template, {
      movies: {},
      user: req.user,
      planInfo: req.user && req.user.subscriptionPlan ? PLAN_CONFIG[req.user.subscriptionPlan] : null,
      platforms: [],
      platformMovies: [],
      platformLabel: 'All Platforms',
      visibleMovies: [],
      activePlatform: '',
      stats: {
        totalMovies: 0,
        platformCount: 0,
        visibleTitles: 0,
        averageRating: '0.0'
      },
      allowedPlatforms: [],
      allowedPlatformSlugs: [],
      sections: {
        actionPacked: [],
        sciFiFrontier: [],
        freshDrops: [],
        dramaClassics: [],
        awardBuzz: []
      },
      aiRecommendations: []
    });
  }
}

async function renderPlatformGrid(req, res) {
  try {
    const movies = await fetchMovies();
    const user = req.user;
    const { planPlatforms, allowedSet } = scopeMoviesForUser(user, movies);
    const slug = (req.params.platform || '').toLowerCase();
    if (allowedSet && !allowedSet.has(slug)) {
      req.flash('error_msg', 'Upgrade your plan to access this platform.');
      return res.redirect('/subscribe');
    }
    const scopedMovies =
      allowedSet instanceof Set
        ? movies.filter(movie => allowedSet.has((movie.platform || 'featured').toLowerCase()))
        : movies;
    const platforms = Array.from(new Set(scopedMovies.map(m => (m.platform || 'Featured'))));
    const filtered = scopedMovies.filter(movie => (movie.platform || 'featured').toLowerCase() === slug);
    if (!filtered.length) {
      req.flash('error_msg', 'No titles found for that platform');
      return res.redirect('/');
    }
    res.render('platform-grid', {
      user: req.user,
      movies: filtered,
      platformLabel: filtered[0].platform || 'Featured',
      platforms,
      activePlatform: slug
    });
  } catch (error) {
    console.error('Platform grid error:', error);
    req.flash('error_msg', 'Unable to load platform catalog');
    res.redirect('/');
  }
}

async function renderAdminFilms(req, res) {
  try {
    const [movies, users] = await Promise.all([fetchMovies(), User.find({}, 'myList name').lean()]);
    const watchMap = {};
    users.forEach(user => {
      (user.myList || []).forEach(title => {
        const key = String(title);
        watchMap[key] = (watchMap[key] || 0) + 1;
      });
    });
    const decorated = movies.map(movie => ({
      ...movie,
      watchCount: watchMap[movie.title] || 0,
      snippet: movie.description ? (movie.description.length > 140 ? `${movie.description.slice(0, 140)}…` : movie.description) : 'No synopsis yet.'
    }));
    res.render('admin-films', {
      user: req.user,
      movies: decorated
    });
  } catch (error) {
    console.error('Error rendering admin films:', error);
    req.flash('error_msg', 'Unable to load film stats');
    res.redirect('/');
  }
}

async function createMovie(payload) {
  const movie = await movieStore.createMovie(payload);
  const mapped = mapMovies([movie])[0];
  await invalidateMovieCache();
  eventBus.emit('movie:created', mapped);
  return mapped;
}

async function createMoviesBulk(payloads = []) {
  if (!Array.isArray(payloads) || !payloads.length) return [];
  const inserted = await movieStore.createMoviesBulk(payloads);
  if (inserted.length) {
    await invalidateMovieCache();
    inserted.forEach(movie => {
      eventBus.emit('movie:created', movie);
    });
  }
  return inserted;
}

async function updateMovie(id, payload) {
  const movieId = Types.ObjectId.isValid(String(id)) ? String(id) : null;
  if (!movieId) throw new Error('Invalid movie id');
  const updatedRow = await movieStore.updateMovie(movieId, payload);
  await invalidateMovieCache();
  const mapped = updatedRow ? mapMovies([updatedRow])[0] : null;
  if (mapped) {
    eventBus.emit('movie:updated', mapped);
  }
  return mapped;
}

async function deleteMovie(id) {
  const movieId = Types.ObjectId.isValid(String(id)) ? String(id) : null;
  if (!movieId) throw new Error('Invalid movie id');
  const deletedRow = await movieStore.deleteMovie(movieId);
  await invalidateMovieCache();
  if (deletedRow) {
    eventBus.emit('movie:deleted', { _id: String(deletedRow.id || deletedRow._id), title: deletedRow.title });
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
  renderPlatformGrid,
  createMovie,
  createMoviesBulk,
  updateMovie,
  deleteMovie,
  fetchMovies,
  getMovieAnalytics,
  renderAdminFilms,
  scopeMoviesForUser
};
