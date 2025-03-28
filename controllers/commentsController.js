const Article = require("../models/Article");
const User = require("../models/User");
const Comment = require("../models/Comment");
const asyncHandler = require("express-async-handler");

const addCommentsToArticle = asyncHandler(async (req, res) => {
  const id = req.user.id;

  const commenter = await User.findById(id).exec();

  if (!commenter) {
    return res.status(401).json({
      message: "User Not Found",
    });
  }

  const article = await Article.findById(req.params.id);

  if (!article) {
    return res.status(401).json({
      message: "Article Not Found",
    });
  }

  const { body } = req.body;

  try {
    const newComment = new Comment({
      body,
      author: commenter._id,
      article: article._id,
    });

    await newComment.save();

    article.comments.push(newComment._id);
    await article.save();
    return res.status(200).json({
      comment: newComment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating comment", error: error.message });
  }
});

const getCommentsFromArticle = asyncHandler(async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate({
      path: "comments",
      populate: {
        path: "author",
        select: "username name image",
      },
    });

    if (!article) {
      return res.status(404).json({
        message: "Article Not Found",
      });
    }

    res.json({ comments: article.comments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting comments", error: error.message });
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: "Article Not Found",
      });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment Not Found",
      });
    }

    // Check if user is the comment author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        error: "Only the author of the comment can delete the comment",
      });
    }

    // Remove comment from the article's comments array
    article.comments = article.comments.filter(
      (commentId) => commentId.toString() !== comment._id.toString()
    );
    await article.save();

    // Delete the comment
    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({
      message: "Comment has been successfully deleted!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
});

module.exports = {
  addCommentsToArticle,
  getCommentsFromArticle,
  deleteComment,
};
