// models/User.js
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
    },
    bio: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png",
    },
    favouriteArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pg38Article",
      },
    ],
    followingUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pg38User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(uniqueValidator);

// CRITICAL: Uncommented these methods that are used by Article.js
userSchema.methods.toProfileJSON = function (user) {
  return {
    username: this.username,
    bio: this.bio || "",
    image: this.image,
    following: user ? user.isFollowing(this._id) : false,
  };
};

userSchema.methods.isFollowing = function (id) {
  const idStr = id.toString();
  for (const followingUser of this.followingUsers) {
    if (followingUser.toString() === idStr) {
      return true;
    }
  }
  return false;
};

userSchema.methods.isFavourite = function (id) {
  const idStr = id.toString();
  for (const article of this.favouriteArticles) {
    if (article.toString() === idStr) {
      return true;
    }
  }
  return false;
};

// Other utility methods that might be needed
userSchema.methods.follow = function (id) {
  if (this.followingUsers.indexOf(id) === -1) {
    this.followingUsers.push(id);
  }
  return this.save();
};

userSchema.methods.unfollow = function (id) {
  if (this.followingUsers.indexOf(id) !== -1) {
    this.followingUsers.remove(id);
  }
  return this.save();
};

userSchema.methods.favourite = function (id) {
  if (this.favouriteArticles.indexOf(id) === -1) {
    this.favouriteArticles.push(id);
  }
  return this.save();
};

userSchema.methods.unfavourite = function (id) {
  if (this.favouriteArticles.indexOf(id) !== -1) {
    this.favouriteArticles.remove(id);
  }
  return this.save();
};

module.exports = mongoose.model("pg38User", userSchema);