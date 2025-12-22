const { scopeMoviesForUser } = require('../controllers/movieController');
const { PLAN_CONFIG } = require('../config/plans');

describe('scopeMoviesForUser', () => {
  const movies = [
    { title: 'Matrix', platform: 'Netflix' },
    { title: 'Dune', platform: 'HBO' },
    { title: 'Loki', platform: 'Disney+' }
  ];

  it('returns full catalog for admins', () => {
    const { scopedMovies } = scopeMoviesForUser({ isAdmin: true }, movies);
    expect(scopedMovies.map(m => m.title)).toEqual(['Matrix', 'Dune', 'Loki']);
  });

  it('filters catalog based on plan platforms', () => {
    const { scopedMovies, allowedSlugs } = scopeMoviesForUser(
      { isAdmin: false, subscriptionPlan: 'plus' },
      movies
    );
    expect(allowedSlugs.sort()).toEqual(PLAN_CONFIG.plus.platforms.map(p => p.toLowerCase()).sort());
    expect(scopedMovies.map(m => m.title).sort()).toEqual(['Loki', 'Matrix']);
  });

  it('falls back to all movies when user has no plan', () => {
    const { scopedMovies, allowedSet } = scopeMoviesForUser(null, movies);
    expect(allowedSet).toBeNull();
    expect(scopedMovies.length).toBe(3);
  });
});