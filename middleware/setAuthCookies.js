
function setAuthCookies(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProduction, 
    sameSite: isProduction ? "none" : "lax", 
    path: "/", 
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/user/refresh-token",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
}

module.exports = { setAuthCookies };
