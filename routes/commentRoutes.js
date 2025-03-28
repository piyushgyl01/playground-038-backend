const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middleware/verifyJWT");
const { verifyJWTOptional } = require("../middleware/verifyJWTOptional");
const commentController = require("../controllers/commentsController");

// Add a comment to an article
router.post("/:id/comments", verifyJWT, commentController.addCommentsToArticle);

// Get comments for an article
router.get("/:id/comments", verifyJWTOptional, commentController.getCommentsFromArticle);

// Delete a comment
router.delete(
  "/:id/comments/:commentId",
  verifyJWT,
  commentController.deleteComment
);

module.exports = router;