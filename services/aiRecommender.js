const User = require('../models/User');
const { getEngagementSnapshot } = require('./engagementService');
const { PLAN_CONFIG } = require('../config/plans');

const GENRE_KEYWORDS = {
  action: ['action', 'fight', 'battle', 'war', 'mission', 'spy'],
  adventure: ['adventure', 'quest', 'journey', 'treasure', 'expedition'],
  animation: ['animation', 'animated', 'pixar', 'cartoon'],
  comedy: ['comedy', 'funny', 'laugh', 'humor', 'sitcom'],
  crime: ['crime', 'heist', 'caper', 'detective', 'mystery'],
  documentary: ['documentary', 'true story', 'biography', 'biopic', 'docu'],
  drama: ['drama', 'character', 'story', 'emotional', 'tearjerker'],
  family: ['family', 'kids', 'together', 'all ages'],
  fantasy: ['fantasy', 'magic', 'dragon', 'sorcery', 'myth'],
  horror: ['horror', 'scary', 'ghost', 'haunted', 'slasher'],
  musical: ['musical', 'music', 'concert', 'performance'],
  romance: ['romance', 'romantic', 'love', 'date night'],
  scifi: ['sci-fi', 'science', 'future', 'space', 'galaxy'],
  thriller: ['thriller', 'suspense', 'twist', 'tense'],
  war: ['war', 'soldier', 'military'],
  western: ['western', 'cowboy', 'frontier']
};

const MOOD_KEYWORDS = {
  uplifting: ['feel-good', 'uplifting', 'heartwarming', 'inspiring', 'hopeful'],
  dark: ['dark', 'gritty', 'bleak', 'brooding', 'noir'],
  intense: ['intense', 'edge', 'adrenaline', 'pulse', 'high stakes'],
  romantic: ['romantic', 'love', 'date'],
  funny: ['funny', 'light', 'hilarious'],
  smart: ['smart', 'mind-bending', 'complex', 'clever'],
  cozy: ['cozy', 'comfort', 'slow', 'calm']
};

const LENGTH_KEYWORDS = {
  short: ['short', 'quick', 'bite-sized', 'snappy'],
  long: ['epic', 'long', 'saga', '3-hour', 'extended']
};

const ERA_KEYWORDS = [
  { key: 'classic', before: 2005, keywords: ['classic', 'retro', 'old school', 'nostalgic'] },
  { key: 'modern', after: 2018, keywords: ['new', 'recent', 'latest', 'modern', '2020s'] }
];

const GENERAL_FACTS = [
  'The first public film screening happened in 1895 when the Lumière brothers projected ten short movies to a paying audience in Paris.',
  'The Dolby Atmos sound format can render up to 128 audio objects, letting engineers place sound literally above your head.',
  'The word “trailer” comes from how movie previews originally played after the feature film, not before it.',
  'In 2023, more scripted TV series were produced worldwide than at any other time in history.',
  'Early film reels were hand-colored frame by frame to add splashes of red and yellow before color film existed.',
  'The longest-running cinema in the world is the Eden Theater in La Ciotat, France, opened in 1899.',
  'Streaming compression algorithms now analyze each frame to decide whether to keep or discard a single pixel — that\'s millions of decisions per second.',
  'Most feature films still record audio on separate devices (called double-system sound) even in the digital era.',
  'Rotten Tomatoes launched in 1998 as a fan site dedicated to Jackie Chan movies before expanding to other films.',
  'The Academy Awards statuette\'s formal name is the “Academy Award of Merit,” and it weighs 8.5 pounds.'
];

const GENERAL_FOLLOW_UPS = [
  'Recommend a gripping thriller',
  'Show me something feel-good',
  'Find a short movie under 100 minutes',
  'Suggest a futuristic sci-fi epic',
  'Give me a cozy weekend pick',
  'Line up an award contender',
  'What should I watch with friends?'
];

const SMALL_TALK_RESPONSES = [
  {
    regex: /(hello|hey|hi|sup|good (morning|evening|afternoon))/i,
    build: () => 'Hey there! I\'m Lumi, your Cineverse concierge. Want me to line up something to watch?'
  },
  {
    regex: /(how are you|how\'s it going|everything ok|how r u|hows u)/i,
    build: () => 'I\'m feeling cinematic and fully charged. Ready when you want a new binge!'
  },
  {
    regex: /(who are you|what are you|your name|tell me about you)/i,
    build: () => 'I\'m Lumi — a lightweight AI guide that fuses your watchlist, community signals, and catalog trends into quick picks.'
  },
  {
    regex: /(thank you|thanks|appreciate it)/i,
    build: () => 'Always happy to help. Queue up another request whenever you\'re ready.'
  },
  {
    regex: /(joke|funny)/i,
    build: () => 'Film joke break: Why did the scarecrow win an Oscar? Because he was outstanding in his field.'
  }
];

const MOVIE_KEYWORD_PATTERN =
  /(movie|film|show|series|episode|watch|recommend|cinema|trailer|genre|platform|documentary|animated|animation|binge|season|drama|thriller|comedy|horror|romance|sci[- ]?fi|science fiction|trending|popular|best|top|must[- ]see)/i;

const KNOWLEDGE_RESPONSES = [
  {
    regex: /(oscars|academy awards)/i,
    build: () =>
      'The Academy Awards (Oscars) have honored film craft since 1929. Only three films have swept the “Big Five” (Picture, Director, Screenplay, Actor, Actress): It Happened One Night, One Flew Over the Cuckoo\'s Nest, and The Silence of the Lambs.'
  },
  {
    regex: /(imdb|rotten tomatoes|metacritic)/i,
    build: () =>
      'IMDb scores are user-weighted ratings out of 10, Rotten Tomatoes shows % of positive critic reviews, while Metacritic averages critic scores on a 0–100 scale. Cineverse stores the IMDb-style score for consistency.'
  },
  {
    regex: /(film festival|sundance|cannes|tiff)/i,
    build: () =>
      'Prestige festivals like Sundance, Cannes, Toronto (TIFF), and Venice often premiere films months before wide release. They\'re great spots to discover future award contenders or debut directors.'
  },
  {
    regex: /(test|diagnostic|status)/i,
    build: () =>
      'Cineverse services self-test continuously: Redis cache uptime, movie ingestion health, and analytics pipelines emit to the admin dashboard. Ask for “dashboard status” to see those charts.'
  },
  {
    regex: /(bingewatch|binge|backlog)/i,
    build: () =>
      'When binge-watching, remember Netflix coined the term with House of Cards in 2013, but “binge” marathons go back to VHS box sets and even LaserDisc collectors.'
  },
  {
    regex: /(hdr|dolby vision|4k|uhd|atmos)/i,
    build: () =>
      'For the best picture, HDR (Dolby Vision or HDR10) boosts contrast and color volume, while 4K bumps resolution. Pair it with Dolby Atmos for precise, height-aware sound staging.'
  },
  {
    regex: /(aspect ratio|letterbox|imax)/i,
    build: () =>
      'Aspect ratios change the feel of a film: 2.39:1 is the cinemascope “wide” look, 1.85:1 is classic theatrical, and IMAX often expands to ~1.90:1 for taller frames.'
  },
  {
    regex: /(streaming tips|buffer|bitrate|bandwidth)/i,
    build: () =>
      'Streaming tips: hardwire via Ethernet when possible, close other bandwidth-heavy apps, and set your TV to “Filmmaker Mode” or disable motion smoothing to avoid the soap opera effect.'
  }
];

const SLANG_MAP = {
  u: 'you',
  ur: 'your',
  pls: 'please',
  plz: 'please',
  thx: 'thanks',
  tks: 'thanks',
  imo: 'in my opinion',
  idk: 'i do not know',
  btw: 'by the way',
  fave: 'favorite',
  fav: 'favorite',
  recs: 'recommendations',
  rec: 'recommendation',
  sth: 'something',
  smth: 'something',
  wtv: 'whatever',
  gonna: 'going to',
  wanna: 'want to',
  gotta: 'have to',
  cuz: 'because',
  bc: 'because',
  wya: 'where are you',
  vibey: 'vibe filled'
};

const FAQ_RESPONSES = [
  {
    regex: /(subscription|plan|upgrade|tier|pricing|bundle)/i,
    build: context => {
      const summary = getPlanSummary(context.user);
      const topLine = summary
        ? summary
        : 'Cineverse offers Free, Plus, and Pro bundles — each unlocks more simultaneous platforms and higher fidelity streaming.';
      const details = Object.values(PLAN_CONFIG)
        .map(plan => `${plan.name}: ${plan.platforms.length} platforms • ${plan.features[0]}`)
        .join(' | ');
      return `${topLine} ${details}`;
    }
  },
  {
    regex: /(platform|access|available|catalog|library)/i,
    build: context => {
      const planPlatforms = getAccessiblePlatforms(context.user);
      if (planPlatforms.length) {
        return `You currently have ${planPlatforms.length} platforms unlocked: ${planPlatforms.join(', ')}. Use the platform rail on the left to jump straight into any of them.`;
      }
      return 'Once you pick a plan, Cineverse filters every rail to the platforms included in your bundle so you never see locked titles.';
    }
  },
  {
    regex: /(lumi|assistant|ai|chatbot|concierge)/i,
    build: () =>
      'Lumi is a slim AI layer that blends your watchlist, trailer engagement, and member-wide trends to craft recommendations. Ask for a vibe, an era, or even a runtime and Lumi will adapt.'
  },
  {
    regex: /(analytics|dashboard|metrics)/i,
    build: () =>
      'The dashboard aggregates movie analytics (genre splits, year timelines, rating histograms) alongside relational health checks so admins can monitor ingestion quality at a glance.'
  },
  {
    regex: /(payment|checkout|card|billing|invoice)/i,
    build: () =>
      'Payments are collected securely on plan selection. You can choose card, UPI, or PayPal-style wallets. Billing ties to your Cineverse account so watchlist and platform unlocks update immediately after confirmation.'
  }
];

function normalizeToken(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function sanitizeText(text = '') {
  return text.toLowerCase().trim();
}

function expandSlang(prompt = '') {
  return prompt.replace(/\b([a-z']+)\b/gi, (match, word) => {
    const replacement = SLANG_MAP[word.toLowerCase()];
    return replacement ? replacement : match;
  });
}

function tokenize(text = '') {
  return sanitizeText(text)
    .split(/[\s,.;:!?/\\]+/)
    .filter(Boolean);
}

function extractGenresFromPrompt(prompt = '') {
  const tokens = tokenize(prompt);
  const normalizedTokens = tokens.map(normalizeToken);
  const lowerPrompt = prompt.toLowerCase();
  const genres = new Set();
  Object.entries(GENRE_KEYWORDS).forEach(([genre, keywords]) => {
    keywords.forEach(keyword => {
      const sanitized = normalizeToken(keyword);
      if (normalizedTokens.includes(sanitized)) genres.add(genre);
      if (lowerPrompt.includes(keyword)) genres.add(genre);
    });
  });
  return Array.from(genres);
}

function extractMood(prompt = '') {
  const tokens = tokenize(prompt);
  const normalizedTokens = tokens.map(normalizeToken);
  const lowerPrompt = prompt.toLowerCase();
  const moods = new Set();
  Object.entries(MOOD_KEYWORDS).forEach(([mood, keywords]) => {
    keywords.forEach(keyword => {
      const sanitized = normalizeToken(keyword);
      if (normalizedTokens.includes(sanitized)) moods.add(mood);
      if (lowerPrompt.includes(keyword)) moods.add(mood);
    });
  });
  return Array.from(moods);
}

function extractLengthPreference(prompt = '') {
  const tokens = tokenize(prompt);
  const normalizedTokens = tokens.map(normalizeToken);
  for (const [length, keywords] of Object.entries(LENGTH_KEYWORDS)) {
    const matchesKeyword = keywords.some(keyword => {
      const sanitized = normalizeToken(keyword);
      return normalizedTokens.includes(sanitized) || prompt.toLowerCase().includes(keyword);
    });
    if (matchesKeyword) {
      return length;
    }
  }
  return null;
}

function extractEraPreference(prompt = '') {
  const lower = prompt.toLowerCase();
  const intent = {};
  ERA_KEYWORDS.forEach(entry => {
    if (entry.keywords.some(keyword => lower.includes(keyword))) {
      if (entry.before) intent.before = entry.before;
      if (entry.after) intent.after = entry.after;
    }
  });
  const yearMatch = lower.match(/(19|20)\d{2}/g);
  if (yearMatch) {
    const years = yearMatch.map(str => Number(str)).sort();
    if (years.length === 1) {
      intent.after = Math.max(intent.after || 0, years[0] - 2);
      intent.before = Math.min(intent.before || 9999, years[0] + 2);
    } else {
      intent.after = years[0];
      intent.before = years[years.length - 1];
    }
  }
  return intent;
}

function parsePrompt(prompt = '') {
  const expanded = expandSlang(prompt);
  const genres = extractGenresFromPrompt(expanded);
  const mood = extractMood(expanded);
  const length = extractLengthPreference(expanded);
  const era = extractEraPreference(expanded);
  return {
    raw: prompt,
    normalized: expanded,
    genres,
    mood,
    length,
    era
  };
}

function pickRandom(list = []) {
  if (!Array.isArray(list) || !list.length) return null;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

function hasMovieIntent(prompt = '', intent = {}) {
  if (!prompt) return Boolean(intent.genres && intent.genres.length);
  if (intent.genres && intent.genres.length) return true;
  return MOVIE_KEYWORD_PATTERN.test(expandSlang(prompt));
}

function getFollowUpPrompts(type) {
  const base = [...GENERAL_FOLLOW_UPS];
  if (type === 'time') base.unshift('Find a quick watch under 90 minutes');
  if (type === 'weather') base.unshift('Suggest a cozy rainy-day film');
  if (type === 'mood') base.unshift('Line up something uplifting');
  const seen = new Set();
  const prompts = [];
  base.forEach(prompt => {
    if (!seen.has(prompt) && prompts.length < 3) {
      seen.add(prompt);
      prompts.push(prompt);
    }
  });
  return prompts;
}

function getPlanSummary(user) {
  if (!user || !user.subscriptionPlan) return null;
  const plan = PLAN_CONFIG[user.subscriptionPlan];
  if (!plan) return null;
  const preview = plan.platforms.slice(0, 4).join(', ');
  if (plan.platforms.length > 4) {
    return `You're on the ${plan.name} plan with access to ${plan.platforms.length} platforms (${preview}, …).`;
  }
  return `You're on the ${plan.name} plan with access to ${plan.platforms.join(', ')}.`;
}

function getAccessiblePlatforms(user) {
  if (!user || !user.subscriptionPlan) return [];
  const plan = PLAN_CONFIG[user.subscriptionPlan];
  return plan ? plan.platforms : [];
}

function buildTrendingSnapshot(movies = [], limit = 3) {
  if (!Array.isArray(movies) || !movies.length) return [];
  return [...movies]
    .sort((a, b) => {
      const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return Number(b.year || 0) - Number(a.year || 0);
    })
    .slice(0, limit)
    .map(movie => ({
      title: movie.title,
      platform: movie.platform,
      rating: movie.rating,
      runtime: movie.runtime,
      year: movie.year,
      genres: movie.genres,
      description: movie.description,
      reason: 'Member-favorite pick',
      trailerUrl: movie.trailerUrl || '',
      poster: movie.poster,
      aiScore: Number(movie.rating || 0)
    }));
}

function getGeneralResponse(prompt = '', context = {}) {
  const expanded = expandSlang(prompt);
  const lower = expanded.toLowerCase();
  const { user, movies } = context;
  const now = new Date();
  if (/time|clock|hour/.test(lower)) {
    return {
      message: `It's ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} where Cineverse is tuned. Perfect slot for a focused feature.`,
      followUps: getFollowUpPrompts('time')
    };
  }
  if (/date|day|today/.test(lower)) {
    return {
      message: `Today is ${now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}. Fresh episodes and premieres just synced.`,
      followUps: getFollowUpPrompts('mood')
    };
  }
  if (/weather|rain|sunny|snow/i.test(lower)) {
    return {
      message: `I can't peek out a window, but I can pair any weather with a vibe — from rainy-day comfort flicks to sunny adventure epics.`,
      followUps: getFollowUpPrompts('weather')
    };
  }
  const knowledge = KNOWLEDGE_RESPONSES.find(entry => entry.regex.test(lower));
  if (knowledge) {
    return {
      message: knowledge.build({ user }),
      followUps: getFollowUpPrompts('mood'),
      suggestions: buildTrendingSnapshot(movies, 2)
    };
  }
  const faq = FAQ_RESPONSES.find(entry => entry.regex.test(lower));
  if (faq) {
    return {
      message: faq.build({ user }),
      followUps: getFollowUpPrompts('mood')
    };
  }
  const matchedSmallTalk = SMALL_TALK_RESPONSES.find(entry => entry.regex.test(lower));
  if (matchedSmallTalk) {
    return {
      message: matchedSmallTalk.build(),
      followUps: getFollowUpPrompts()
    };
  }
  const planSummary = getPlanSummary(user);
  if (planSummary) {
    const trending = buildTrendingSnapshot(movies, 2);
    return {
      message: `${planSummary} Want me to refresh picks or highlight a niche genre?`,
      followUps: getFollowUpPrompts(),
      suggestions: trending
    };
  }
  const fact = pickRandom(GENERAL_FACTS);
  return {
    message: `Quick fact: ${fact} Ready for a fresh recommendation?`,
    followUps: getFollowUpPrompts(),
    suggestions: buildTrendingSnapshot(movies, 3)
  };
}

function buildMovieIndex(movies = []) {
  return movies.reduce((acc, movie) => {
    if (movie.title) {
      acc[movie.title] = movie;
    }
    return acc;
  }, {});
}

async function getCollaborativeScores() {
  const users = await User.find({}, 'myList').lean();
  const counts = {};
  users.forEach(user => {
    (user.myList || []).forEach(title => {
      const key = String(title);
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  return counts;
}

function buildUserProfile(user, movieIndex) {
  const profile = {
    savedSet: new Set(),
    genreWeights: {},
    castWeights: {},
    directorWeights: {},
    savedMovies: [],
    savedGenreSet: new Set()
  };

  if (!user) return profile;
  const savedList = Array.isArray(user.myList) ? user.myList : [];
  savedList.forEach(title => {
    profile.savedSet.add(title);
    const movie = movieIndex[title];
    if (movie) {
      profile.savedMovies.push(movie);
      (movie.genres || []).forEach(genre => {
        const key = normalizeToken(genre);
        profile.genreWeights[key] = (profile.genreWeights[key] || 0) + 1;
        profile.savedGenreSet.add(key);
      });
      if (movie.director) {
        const key = movie.director.toLowerCase();
        profile.directorWeights[key] = (profile.directorWeights[key] || 0) + 1.25;
      }
      (movie.cast || []).forEach(member => {
        const key = member.toLowerCase();
        profile.castWeights[key] = (profile.castWeights[key] || 0) + 0.85;
      });
    }
  });

  return profile;
}

function normalizeScore(value, min = 0, max = 10) {
  if (!Number.isFinite(value)) return 0;
  const clamped = Math.max(min, Math.min(max, value));
  return (clamped - min) / Math.max(max - min, 1);
}

function collectSimilarityBoost(movie, profile) {
  const genres = movie.genres || [];
  if (!genres.length || !Object.keys(profile.genreWeights).length) {
    return { score: 0, hint: null };
  }

  let boost = 0;
  let hint = null;
  genres.forEach(genre => {
    const normalized = normalizeToken(genre);
    const weight = profile.genreWeights[normalized] || 0;
    if (weight) {
      const increment = weight * 0.9;
      boost += increment;
      if (!hint || increment > hint.weight) {
        hint = { type: 'genre', value: genre, weight: increment };
      }
    }
  });

  return { score: boost, hint };
}

function collectTalentBoost(movie, profile) {
  const hints = [];
  let boost = 0;
  if (movie.director) {
    const key = movie.director.toLowerCase();
    if (profile.directorWeights[key]) {
      boost += profile.directorWeights[key] * 0.8;
      hints.push({ type: 'director', value: movie.director, weight: profile.directorWeights[key] });
    }
  }
  (movie.cast || []).forEach(member => {
    const key = member.toLowerCase();
    if (profile.castWeights[key]) {
      boost += profile.castWeights[key] * 0.5;
      hints.push({ type: 'cast', value: member, weight: profile.castWeights[key] });
    }
  });
  if (!boost) return { score: 0, hint: null };
  hints.sort((a, b) => b.weight - a.weight);
  return { score: boost, hint: hints[0] };
}

function buildReasonFromHints(movie, hints = [], defaultFallback) {
  if (!hints.length) return defaultFallback || `Highly rated ${movie.genres?.[0] || 'feature'}`;
  hints.sort((a, b) => (b.weight || 0) - (a.weight || 0));
  const top = hints[0];
  switch (top.type) {
    case 'genre':
      return `Because you love ${top.value} stories`;
    case 'director':
      return `More from ${top.value}`;
    case 'cast':
      return `${top.value} returns in this one`;
    case 'mood':
      return `Matches your requested ${top.value} vibe`;
    case 'trending':
      return `Trending after ${top.value} trailer plays`;
    case 'social':
      return `${top.value} other fans saved this`;
    default:
      return defaultFallback || 'Smart match for you';
  }
}

function scoreMovieForProfile(movie, profile, engagementMap, collaborative) {
  if (!movie) return { score: 0, hints: [] };
  const hints = [];
  let score = 0;

  const ratingBoost = normalizeScore(Number(movie.rating || 0), 4, 9.5) * 2.2;
  score += ratingBoost;

  const genreBoost = collectSimilarityBoost(movie, profile);
  score += genreBoost.score;
  if (genreBoost.hint) hints.push(genreBoost.hint);

  const talentBoost = collectTalentBoost(movie, profile);
  score += talentBoost.score;
  if (talentBoost.hint) hints.push(talentBoost.hint);

  const engagement = engagementMap[movie.title] || { trailerViews: 0, saveCount: 0 };
  const collaborativeScore = collaborative[movie.title] || 0;
  const trailerBoost = Math.log(1 + engagement.trailerViews) * 0.9;
  const socialBoost = Math.log(1 + collaborativeScore + engagement.saveCount) * 1.1;
  if (trailerBoost > 0.2) hints.push({ type: 'trending', value: engagement.trailerViews || 1, weight: trailerBoost });
  if (socialBoost > 0.2) hints.push({ type: 'social', value: collaborativeScore + engagement.saveCount, weight: socialBoost });
  score += trailerBoost + socialBoost;

  const recencyBoost = movie.year ? normalizeScore(movie.year, 1995, new Date().getFullYear()) : 0;
  score += recencyBoost * 0.4;

  return { score, hints };
}

function scoreMovieForPrompt(movie, intent, engagementMap) {
  let score = 0;
  const hints = [];
  const reducedGenres = (movie.genres || []).map(normalizeToken);
  const desiredGenres = intent.genres.map(normalizeToken);

  if (intent.genres.length) {
    const overlap = desiredGenres.filter(genre => reducedGenres.includes(genre));
    if (overlap.length) {
      const boost = overlap.length * 2.5;
      score += boost;
      const originalGenre = movie.genres.find(genre => normalizeToken(genre) === overlap[0]) || overlap[0];
      hints.push({ type: 'genre', value: originalGenre, weight: boost });
    } else {
      score -= 1.5;
    }
  }

  if (intent.length) {
    if (intent.length === 'short' && movie.runtime && /\d+/.test(movie.runtime)) {
      const mins = Number(movie.runtime.match(/\d+/)[0]);
      if (mins <= 110) score += 1.2;
    }
    if (intent.length === 'long' && movie.runtime && /\d+/.test(movie.runtime)) {
      const mins = Number(movie.runtime.match(/\d+/)[0]);
      if (mins >= 120) score += 1.2;
    }
  }

  if (intent.era.before || intent.era.after) {
    const year = Number(movie.year);
    if (intent.era.before && year > intent.era.before) score -= 1;
    if (intent.era.after && year && year < intent.era.after) score -= 1;
    if (
      Number.isFinite(year) &&
      (!intent.era.before || year <= intent.era.before) &&
      (!intent.era.after || year >= intent.era.after)
    ) {
      score += 1.4;
    }
  }

  const engagement = engagementMap[movie.title] || { trailerViews: 0, saveCount: 0 };
  const engagementBoost = Math.log(1 + engagement.trailerViews + engagement.saveCount) * 0.9;
  if (engagementBoost > 0.2) {
    hints.push({ type: 'trending', value: engagement.trailerViews || engagement.saveCount || 1, weight: engagementBoost });
  }
  score += engagementBoost + normalizeScore(movie.rating || 0, 5, 9.7) * 1.8;

  if (!Number.isFinite(score)) score = 0;
  return { score, hints };
}

async function getPersonalizedRecommendations({ user, movies = [], limit = 8 } = {}) {
  if (!movies.length) return [];
  const movieIndex = buildMovieIndex(movies);
  const profile = buildUserProfile(user, movieIndex);
  const engagementMap = await getEngagementSnapshot();
  const collaborative = await getCollaborativeScores();

  const candidates = movies
    .filter(movie => movie && movie.title && !profile.savedSet.has(movie.title))
    .map(movie => {
      const { score, hints } = scoreMovieForProfile(movie, profile, engagementMap, collaborative);
      return {
        movie,
        score,
        reason: buildReasonFromHints(movie, hints)
      };
    })
    .filter(item => item.score > 0.25);

  candidates.sort((a, b) => b.score - a.score);
  const slice = candidates.slice(0, limit);

  if (!slice.length) {
    const fallback = movies
      .map(movie => {
        const engagement = engagementMap[movie.title] || { trailerViews: 0, saveCount: 0 };
        const score =
          Math.log(1 + engagement.trailerViews + engagement.saveCount) + normalizeScore(movie.rating || 0, 5, 9) * 2;
        return { movie, score, reason: 'Popular with Cineverse members' };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return fallback.map(entry => ({ ...entry.movie, aiScore: Number(entry.score.toFixed(2)), reason: entry.reason }));
  }

  return slice.map(entry => ({
    ...entry.movie,
    aiScore: Number(entry.score.toFixed(2)),
    reason: entry.reason
  }));
}

async function getConversationalSuggestions(prompt, { movies = [], limit = 5, user } = {}) {
  const intent = parsePrompt(prompt);
  const wantsMovies = hasMovieIntent(prompt, intent);
  if (!wantsMovies) {
    return {
      intent,
      mode: 'general',
      general: getGeneralResponse(prompt, { user, movies })
    };
  }
  const engagementMap = await getEngagementSnapshot();
  const scored = movies
    .map(movie => {
      const { score, hints } = scoreMovieForPrompt(movie, intent, engagementMap);
      return { movie, score, reason: buildReasonFromHints(movie, hints, 'High match for your query') };
    })
    .filter(entry => entry.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (!scored.length) {
    const backup = [...movies]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, limit)
      .map(movie => ({
        movie,
        score: Number(movie.rating || 0),
        reason: 'Top rated pick'
      }));
    return {
      intent,
      mode: 'movies',
      suggestions: backup.map(entry => ({
        title: entry.movie.title,
        platform: entry.movie.platform,
        rating: entry.movie.rating,
        runtime: entry.movie.runtime,
        year: entry.movie.year,
        genres: entry.movie.genres,
        description: entry.movie.description,
        reason: entry.reason,
        trailerUrl: entry.movie.trailerUrl || '',
        poster: entry.movie.poster,
        aiScore: Number(entry.score.toFixed(2))
      }))
    };
  }

  return {
    intent,
    mode: 'movies',
    suggestions: scored.map(entry => ({
      title: entry.movie.title,
      platform: entry.movie.platform,
      rating: entry.movie.rating,
      runtime: entry.movie.runtime,
      year: entry.movie.year,
      genres: entry.movie.genres,
      description: entry.movie.description,
      reason: entry.reason,
      trailerUrl: entry.movie.trailerUrl || '',
      poster: entry.movie.poster,
      aiScore: Number(entry.score.toFixed(2))
    }))
  };
}

module.exports = {
  getPersonalizedRecommendations,
  getConversationalSuggestions
};