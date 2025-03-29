
function setAuthCookies(res, accessToken, refreshToken) {
  // For production deployment with cross-domain cookies
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProduction, // Must be true in production
    sameSite: isProduction ? "none" : "lax", // "none" allows cross-domain cookies
    path: "/", // Accessible at all paths
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction, // Must be true in production
    sameSite: isProduction ? "none" : "lax", // "none" allows cross-domain cookies
    path: "/api/user/refresh-token", // Match your refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

module.exports = { setAuthCookies };
