// const jwt = require("jsonwebtoken");

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization || req.headers.Authorization;

//   if (!authHeader?.startsWith("Token ")) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const token = authHeader.split(" ")[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: "Forbidden" });
//     }
//     req.userId = decoded.user.id;
//     req.userEmail = decoded.user.email;
//     req.userHashedPwd = decoded.user.password;
//     next();
//   });
// }

// module.exports = verifyJWT;
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

function verifyJWT(req, res, next) {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res
      .status(403)
      .json({ message: "You need to sign in before continuing" });
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid token", error: error.message });
  }
}

module.exports = { verifyJWT };
