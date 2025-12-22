const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const { MovieModel } = require('../models/Movie');
const User = require('../models/User');
const { issueToken } = require('../services/jwtService');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  process.env.MONGO_URI = uri;
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) {
    await mongo.stop();
  }
});

beforeEach(async () => {
  await MovieModel.deleteMany({});
  await User.deleteMany({});
});

function authHeader(userPayload) {
  const token = issueToken(userPayload);
  return { Authorization: `Bearer ${token}` };
}

describe('API integration', () => {
  test('GET /api/movies returns seeded catalog', async () => {
    await MovieModel.create([
      {
        title: 'Inception',
        poster: 'https://example.com/inception.jpg',
        backdrop: 'https://example.com/inception-bg.jpg',
        genres: ['Sci-Fi'],
        platform: 'Netflix',
        description: 'Dream heist',
        year: 2010,
        director: 'Christopher Nolan',
        cast: ['Leonardo DiCaprio'],
        rating: 8.8,
        runtime: '148',
        trailerUrl: 'https://example.com/trailer'
      },
      {
        title: 'Dune',
        poster: 'https://example.com/dune.jpg',
        backdrop: 'https://example.com/dune-bg.jpg',
        genres: ['Sci-Fi'],
        platform: 'HBO',
        description: 'Spice saga',
        year: 2021,
        director: 'Denis Villeneuve',
        cast: ['Timothee Chalamet'],
        rating: 8.1,
        runtime: '155',
        trailerUrl: ''
      }
    ]);

    const headers = authHeader({ _id: new mongoose.Types.ObjectId(), email: 'user@test.com', name: 'User', isAdmin: false });
    const res = await request(app).get('/api/movies').set(headers);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.movies)).toBe(true);
    expect(res.body.movies).toHaveLength(2);
    expect(res.body.movies[0]).toHaveProperty('poster');
    expect(res.body.movies[0]).toHaveProperty('backdrop');
  });

  test('GET /api/movies/analytics returns stats for admin', async () => {
    await MovieModel.create({
      title: 'Interstellar',
      poster: 'https://example.com/interstellar.jpg',
      backdrop: 'https://example.com/interstellar-bg.jpg',
      genres: ['Sci-Fi', 'Drama'],
      platform: 'Netflix',
      description: 'Space-time voyage',
      year: 2014,
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey'],
      rating: 8.6,
      runtime: '169',
      trailerUrl: ''
    });
    await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'hashed',
      isAdmin: true
    });

    const headers = authHeader({ _id: new mongoose.Types.ObjectId(), email: 'admin@test.com', name: 'Admin', isAdmin: true });
    const res = await request(app).get('/api/movies/analytics').set(headers);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalMovies', 1);
    expect(res.body).toHaveProperty('genres');
    expect(res.body).toHaveProperty('userCount', 1);
  });
});
