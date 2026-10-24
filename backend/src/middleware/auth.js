const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'classpulse_jwt_secret_dev';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Express middleware — attaches req.user or returns 401
function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Role guard factory — use after requireAuth
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient role' });
    }
    next();
  };
}

module.exports = { signToken, verifyToken, requireAuth, requireRole };
