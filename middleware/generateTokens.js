const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

function generateTokens(user) {
  const payload = {
    id: user._id,
    username: user.username || user.email,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
}

module.exports = { generateTokens };
