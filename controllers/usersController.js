const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateTokens } = require("../middleware/generateTokens");
const { setAuthCookies } = require("../middleware/setAuthCookies");
const { clearAuthCookies } = require("../middleware/clearAuthCookies");

require("dotenv").config()

// @desc registration for a user
// @route POST /api/users
// @access Public
// @required fields {email, username, password}
// @return User
const registerUser = asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;

  if (!username || !name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email: email || null }],
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.username === username
            ? "Username already exists"
            : "Email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      name,
      email: email || null,
      password: hashedPassword,
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser);

    setAuthCookies(res, accessToken, refreshToken);

    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
    };

    res
      .status(201)
      .json({ message: "User registered successfully", user: userResponse });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

// @desc get currently logged-in user
// @route GET /api/user
// @access Private
// @return User
const getCurrentUser = asyncHandler(async (req, res) => {
  // After authentication; email and hashsed password was stored in req
  try {
    const user = await User.findById(req.user.id).select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
});

// @desc login for a user
// @route POST /api/users/login
// @access Public
// @required fields {email, password}
// @return User
const userLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  try {
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    setAuthCookies(res, accessToken, refreshToken);

    const userResponse = {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    res
      .status(200)
      .json({ message: "Logged in successfully", user: userResponse });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
});

// @desc update currently logged-in user
// Warning: if password or email is updated, client-side must update the token
// @route PUT /api/user
// @access Private
// @return User
const updateUser = asyncHandler(async (req, res) => {
  const id = req.user.id;

  const user = await User.findById(id);

  // confirm data
  if (!user) {
    return res.status(400).json({ message: "Required a User object" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.json({ user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
});

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;


const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  console.log(refreshToken);

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const tokens = generateTokens(user);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Invalid refresh token", error: error.message });
  }
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = {
  registerUser,
  getCurrentUser,
  userLogin,
  updateUser,
  refreshToken,
  logout,
};
