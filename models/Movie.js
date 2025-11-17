const { getPostgresPool } = require('../services/relationalService');

const MOVIE_TABLE = 'cineverse_movies';
const MOVIE_COLUMNS = [
  'id',
  'title',
  'poster',
  'backdrop',
  'genres',
  'description',
  'year',
  'director',
  'cast_members AS cast',
  'rating',
  'runtime',
  'trailer_url AS "trailerUrl"',
  'created_at'
].join(', ');

function assertPool() {
  const pool = getPostgresPool();
  if (!pool) {
    throw new Error('PostgreSQL is not configured. Please set POSTGRES_URL to persist movies.');
  }
  return pool;
}

function mapRow(row) {
  if (!row) return null;
  const mappedId = row.id !== undefined && row.id !== null ? String(row.id) : null;
  return {
    _id: mappedId,
    id: mappedId,
    title: row.title,
    poster: row.poster,
    backdrop: row.backdrop,
    genres: row.genres || [],
    description: row.description,
    year: row.year,
    director: row.director,
    cast: row.cast || [],
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : null,
    runtime: row.runtime,
    trailerUrl: row.trailerUrl || '',
    createdAt: row.created_at
  };
}

function toJsonParam(value, fallback = []) {
  if (value === undefined || value === null) {
    return JSON.stringify(fallback);
  }
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return value;
    } catch (error) {
      return JSON.stringify(fallback);
    }
  }
  return JSON.stringify(value);
}

let ensurePromise;

async function ensureMovieStore() {
  const pool = assertPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MOVIE_TABLE} (
      id SERIAL PRIMARY KEY,
      title TEXT UNIQUE NOT NULL,
      poster TEXT NOT NULL,
      backdrop TEXT NOT NULL,
      genres JSONB NOT NULL,
      description TEXT NOT NULL,
      year INT NOT NULL,
      director TEXT NOT NULL,
      cast_members JSONB NOT NULL,
      trailer_url TEXT DEFAULT '',
      rating NUMERIC(3,1) NOT NULL,
      runtime TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_${MOVIE_TABLE}_year ON ${MOVIE_TABLE} (year DESC);`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_${MOVIE_TABLE}_genres ON ${MOVIE_TABLE} USING GIN (genres);`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_${MOVIE_TABLE}_director ON ${MOVIE_TABLE} (director);`
  );
  await pool.query(
    `ALTER TABLE ${MOVIE_TABLE} ADD COLUMN IF NOT EXISTS trailer_url TEXT DEFAULT '';`
  );
  return { status: 'ready', table: MOVIE_TABLE };
}

async function ensureInitialized() {
  if (!ensurePromise) {
    ensurePromise = ensureMovieStore().catch(error => {
      ensurePromise = null;
      throw error;
    });
  }
  return ensurePromise;
}

async function findAllMovies() {
  await ensureInitialized();
  const pool = assertPool();
  const { rows } = await pool.query(`SELECT ${MOVIE_COLUMNS} FROM ${MOVIE_TABLE} ORDER BY created_at DESC`);
  return rows.map(mapRow);
}

async function findMovieById(id) {
  await ensureInitialized();
  const pool = assertPool();
  const { rows } = await pool.query(
    `SELECT ${MOVIE_COLUMNS} FROM ${MOVIE_TABLE} WHERE id = $1 LIMIT 1`,
    [id]
  );
  return mapRow(rows[0]);
}

async function createMovie(movie) {
  await ensureInitialized();
  const pool = assertPool();
  const { rows } = await pool.query(
    `
      INSERT INTO ${MOVIE_TABLE}
      (title, poster, backdrop, genres, description, year, director, cast_members, rating, runtime, trailer_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING ${MOVIE_COLUMNS}
    `,
    [
      movie.title,
      movie.poster,
      movie.backdrop,
      toJsonParam(movie.genres),
      movie.description,
      movie.year,
      movie.director,
      toJsonParam(movie.cast),
      movie.rating,
      movie.runtime,
      movie.trailerUrl || ''
    ]
  );
  return mapRow(rows[0]);
}

async function updateMovie(id, payload) {
  await ensureInitialized();
  const pool = assertPool();
  const { rows } = await pool.query(
    `
      UPDATE ${MOVIE_TABLE}
      SET title = $1,
          poster = $2,
          backdrop = $3,
          genres = $4,
          description = $5,
          year = $6,
          director = $7,
          cast_members = $8,
          rating = $9,
          runtime = $10,
          trailer_url = $11
      WHERE id = $12
      RETURNING ${MOVIE_COLUMNS}
    `,
    [
      payload.title,
      payload.poster,
      payload.backdrop,
      toJsonParam(payload.genres),
      payload.description,
      payload.year,
      payload.director,
      toJsonParam(payload.cast),
      payload.rating,
      payload.runtime,
      payload.trailerUrl || '',
      id
    ]
  );
  return mapRow(rows[0]);
}

async function deleteMovie(id) {
  await ensureInitialized();
  const pool = assertPool();
  const { rows } = await pool.query(
    `DELETE FROM ${MOVIE_TABLE} WHERE id = $1 RETURNING ${MOVIE_COLUMNS}`,
    [id]
  );
  return mapRow(rows[0]);
}

module.exports = {
  ensureMovieStore,
  findAllMovies,
  findMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};
