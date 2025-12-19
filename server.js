require('dotenv').config();
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const rateLimiterRedis = require('./middlewares/rateLimiterRedis');
const { initRedis } = require('./services/redisCache');
const createSessionStore = require('./services/sessionStore');
const { applySecurityHeaders, getTlsOptions } = require('./services/securityService');
const { initSocketServer } = require('./sockets');
const { ensureMovieIndexes } = require('./services/databaseScaling');

const app = express();

// Initialize shared services
initRedis().catch(err => console.error('Redis init error:', err));

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(async () => {
    console.log('MongoDB Connected...');
    await ensureMovieIndexes();
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

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

const redisStore = createSessionStore(session);
if (redisStore) {
  sessionOptions.store = redisStore;
}

app.use(session(sessionOptions));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

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

const PORT = process.env.PORT || 3000;
const tlsOptions = getTlsOptions();
const server = tlsOptions ? https.createServer(tlsOptions, app) : http.createServer(app);

initSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT} ${tlsOptions ? '(HTTPS)' : '(HTTP)'}`);
});
