const { verifyToken } = require('../services/jwtService');

function authJwt(requiredAdmin = false) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    try {
      const payload = verifyToken(token);
      if (requiredAdmin && !payload.roles.admin) {
        return res.status(403).json({ message: 'Admin privileges required' });
      }
      req.jwt = payload;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
    }
  };
}

module.exports = authJwt;
