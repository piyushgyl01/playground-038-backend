const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

function verifyJWTOptional(req, res, next) {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    // No token provided, but that's fine - just mark user as not authenticated
    req.user = null;
    next();
    return;
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Token invalid, but that's ok for optional authentication
    req.user = null;
    next();
  }
}

module.exports = { verifyJWTOptional };