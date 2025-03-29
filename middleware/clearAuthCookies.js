function clearAuthCookies(res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("access_token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookie("refresh_token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/user/refresh-token",
    maxAge: 0,
  });
}

module.exports = { clearAuthCookies };
