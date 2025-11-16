const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');
const keys = require('./keys');

module.exports = function(passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Check if user has a local password before comparing
        if (!user.password) {
          return done(null, false, { message: 'That email is registered with Google. Please use Google to log in.' });
        }
        // **FIX ENDS HERE**

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.GoogleClientID,
        clientSecret: keys.GoogleClientSecret,
        callbackURL: '/users/auth/google/callback',
        proxy: true
      },
      (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value
        };

        // Check for existing user
        User.findOne({ googleId: profile.id }).then(user => {
          if (user) {
            // Return existing user
            done(null, user);
          } else {
            // Check if email exists
            User.findOne({ email: newUser.email }).then(user => {
              if (user) {
                // If email exists, link googleId and return user
                 user.googleId = newUser.googleId;
                 user.save().then(user => done(null, user));
              } else {
                // Create new user
                new User(newUser)
                  .save()
                  .then(user => done(null, user));
              }
            })
          }
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
  });
};
