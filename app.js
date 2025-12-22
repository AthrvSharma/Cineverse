require('dotenv').config();
const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const rateLimiterRedis = require('./middlewares/rateLimiterRedis');
const createSessionStore = require('./services/sessionStore');
const { applySecurityHeaders } = require('./services/securityService');

// Passport Config
require('./config/passport')(passport);

const app = express();

// Security headers
applySecurityHeaders(app);

// EJS Middleware
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Static
app.use(express.static(path.join(__dirname, 'public')));

// Bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express session with optional Redis store
const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'cineverse-secret',
  resave: false,
  saveUninitialized: false
};

// On Vercel (serverless), don't use Redis for sessions as connections don't persist
if (!process.env.VERCEL) {
  const redisStore = createSessionStore(session);
  if (redisStore) {
    sessionOptions.store = redisStore;
  }
}

app.use(session(sessionOptions));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Ensure MongoDB connection for serverless environments like Vercel
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    next(error);
  }
});

// Rate limit APIs globally as a safety net
app.use('/api', rateLimiterRedis({ prefix: 'global-api', windowInSeconds: 60, allowedHits: 100 }));

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/ai', require('./routes/ai'));
app.use('/api', require('./routes/api'));

module.exports = app;
