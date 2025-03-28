const User = require("../models/User");
const asyncHandler = require("express-async-handler");

const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  
  // Find the requested user profile
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({
      message: "User Not Found",
    });
  }

  // Get basic profile info
  const profile = {
    username: user.username,
    name: user.name,
    bio: user.bio || "",
    image: user.image,
    following: false
  };

  // If user is authenticated, check if they follow this profile
  if (req.user) {
    const currentUser = await User.findById(req.user.id);
    if (currentUser && currentUser.followingUsers) {
      profile.following = currentUser.followingUsers.includes(user._id);
    }
  }

  return res.status(200).json({ profile });
});

const toggleFollow = asyncHandler(async (req, res) => {
  const { username } = req.params;

  // Find the current user and the target user
  const currentUser = await User.findById(req.user.id);
  const targetUser = await User.findOne({ username });

  if (!targetUser) {
    return res.status(404).json({
      message: "User Not Found",
    });
  }

  if (!currentUser) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  // Check if already following
  const isFollowing = currentUser.followingUsers.some(
    id => id.toString() === targetUser._id.toString()
  );

  if (isFollowing) {
    // Unfollow: Remove from following list
    currentUser.followingUsers = currentUser.followingUsers.filter(
      id => id.toString() !== targetUser._id.toString()
    );
  } else {
    // Follow: Add to following list
    currentUser.followingUsers.push(targetUser._id);
  }
  
  await currentUser.save();

  return res.status(200).json({
    profile: {
      username: targetUser.username,
      name: targetUser.name,
      bio: targetUser.bio || "",
      image: targetUser.image,
      following: !isFollowing
    }
  });
});

module.exports = {
  getProfile,
  toggleFollow
};