const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Token generator
function generateToken(userId, username) {
  return jwt.sign(
    { id: userId, username: username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Token verification
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
};