const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_TTL = '1h';

function issueToken(user) {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    roles: {
      admin: Boolean(user.isAdmin)
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'cineverse-jwt-secret', {
    expiresIn: ACCESS_TOKEN_TTL,
    issuer: 'cineverse'
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'cineverse-jwt-secret', {
    issuer: 'cineverse'
  });
}

module.exports = {
  issueToken,
  verifyToken
};
