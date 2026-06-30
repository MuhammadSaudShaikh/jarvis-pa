const { verifyToken } = require('../config/auth');

function verifyTokenMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  // Check if token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  // Token invalid, return error
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
  
  // Token valid, attach user data to request
  req.user = decoded;
  next();
}

module.exports = verifyTokenMiddleware;