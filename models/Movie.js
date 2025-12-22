const mongoose = require('mongoose');

const { Schema, Types } = mongoose;

const MovieSchema = new Schema(
  {
    title: { type: String, required: true, unique: true, index: true },
    poster: { type: String, required: true },
    backdrop: { type: String, required: true },
    genres: { type: [String], default: [] },
    platform: { type: String, default: 'Featured' },
    description: { type: String, required: true },
    year: { type: Number, required: true },
    director: { type: String, required: true },
    cast: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    runtime: { type: String, required: true },
    trailerUrl: { type: String, default: '' }
  },
  {
    collection: 'movies',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

MovieSchema.index({ year: -1 });
MovieSchema.index({ genres: 1 });
MovieSchema.index({ platform: 1 });
MovieSchema.index({ director: 1 });

const Movie = mongoose.model('Movie', MovieSchema);

function coerceStringArray(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  return fallback;
}

function normalizeMoviePayload(movie = {}) {
  return {
    title: (movie.title || '').trim(),
    poster: (movie.poster || '').trim(),
    backdrop: (movie.backdrop || '').trim(),
    genres: coerceStringArray(movie.genres),
    platform: (movie.platform || 'Featured').trim(),
    description: (movie.description || '').trim(),
    year: Number(movie.year),
    director: (movie.director || '').trim(),
    cast: coerceStringArray(movie.cast),
    rating: Number(movie.rating || 0),
    runtime: (movie.runtime || '').trim(),
    trailerUrl: (movie.trailerUrl || '').trim()
  };
}

function mapMovie(doc) {
  if (!doc) return null;
  const movie = doc.toObject ? doc.toObject() : doc;
  const id = movie._id ? movie._id.toString() : '';
  const cast = movie.cast || movie.cast_members || [];
  const trailerUrl = movie.trailerUrl || movie.trailer_url || '';
  return {
    _id: id,
    id,
    title: movie.title,
    poster: movie.poster,
    backdrop: movie.backdrop,
    genres: movie.genres || [],
    platform: movie.platform || 'Featured',
    description: movie.description,
    year: movie.year,
    director: movie.director,
    cast,
    rating: typeof movie.rating === 'number' ? movie.rating : Number(movie.rating || 0),
    runtime: movie.runtime,
    trailerUrl,
    createdAt: movie.createdAt || movie.updatedAt
  };
}

async function ensureMovieStore() {
  await Movie.init();
  return { status: 'ready', collection: Movie.collection.name };
}

async function findAllMovies() {
  await ensureMovieStore();
  const docs = await Movie.find({}).sort({ createdAt: -1 }).lean();
  return docs.map(mapMovie);
}

async function findMovieById(id) {
  if (!Types.ObjectId.isValid(String(id))) return null;
  await ensureMovieStore();
  const doc = await Movie.findById(id).lean();
  return mapMovie(doc);
}

async function createMovie(movie) {
  await ensureMovieStore();
  const doc = await Movie.create(normalizeMoviePayload(movie));
  return mapMovie(doc);
}

async function updateMovie(id, payload) {
  if (!Types.ObjectId.isValid(String(id))) {
    throw new Error('Invalid movie id');
  }
  await ensureMovieStore();
  const doc = await Movie.findByIdAndUpdate(
    id,
    normalizeMoviePayload(payload),
    { new: true, runValidators: true }
  );
  return mapMovie(doc);
}

async function deleteMovie(id) {
  if (!Types.ObjectId.isValid(String(id))) {
    throw new Error('Invalid movie id');
  }
  await ensureMovieStore();
  const doc = await Movie.findByIdAndDelete(id);
  return mapMovie(doc);
}

async function createMoviesBulk(movies = []) {
  if (!Array.isArray(movies) || !movies.length) {
    return [];
  }
  await ensureMovieStore();
  const operations = movies.map(movie => ({
    updateOne: {
      filter: { title: movie.title },
      update: { $setOnInsert: normalizeMoviePayload(movie) },
      upsert: true
    }
  }));
  const result = await Movie.bulkWrite(operations, { ordered: false });
  const insertedIds = Object.values(result.upsertedIds || {});
  if (!insertedIds.length) return [];
  const docs = await Movie.find({ _id: { $in: insertedIds } }).lean();
  return docs.map(mapMovie);
}

module.exports = {
  ensureMovieStore,
  findAllMovies,
  findMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  createMoviesBulk,
  MovieModel: Movie
};
