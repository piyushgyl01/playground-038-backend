const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const slugify = require("slugify");
const User = require("./User");

const articleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    tagList: [
      {
        type: String,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pg38User",
    },
    favouritesCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pg38Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);
// Fix for models/Article.js in backend

// 1. Uncomment the uniqueValidator plugin:
articleSchema.plugin(uniqueValidator);

// 2. Uncomment and update the pre-save hook for slug generation:
articleSchema.pre("save", function (next) {
  // If the title has changed or there's no slug yet, generate a new one
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, replacement: "-" });
    
    // Add uniqueness by appending timestamp to the end if this is a new document
    if (this.isNew) {
      this.slug += `-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

// 3. Uncomment the remaining methods that might be needed:
articleSchema.methods.updateFavoriteCount = async function () {
  const favoriteCount = await User.count({
    favouriteArticles: { $in: [this._id] },
  });
  this.favouritesCount = favoriteCount;

  return this.save();
};

// user is the logged-in user
articleSchema.methods.toArticleResponse = async function (user) {
  const authorObj = await User.findById(this.author).exec();
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favourited: user ? user.isFavourite(this._id) : false,
    favouritesCount: this.favouritesCount,
    author: authorObj.toProfileJSON(user),
  };
};

articleSchema.methods.addComment = function (commentId) {
  if (this.comments.indexOf(commentId) === -1) {
    this.comments.push(commentId);
  }
  return this.save();
};

articleSchema.methods.removeComment = function (commentId) {
  if (this.comments.indexOf(commentId) !== -1) {
    this.comments.remove(commentId);
  }
  return this.save();
};
module.exports = mongoose.model("pg38Article", articleSchema);