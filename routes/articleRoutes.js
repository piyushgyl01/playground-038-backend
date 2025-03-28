const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middleware/verifyJWT");
const articleController = require("../controllers/articlesController");

// router.get("/feed", verifyJWT, articleController.feedArticles);

router.get("/", articleController.allArticles);

router.get("/:id", articleController.singleArticle);

router.post("/", verifyJWT, articleController.createArticle);

router.post("/:id/favorite", verifyJWT, articleController.toggleFavorite);

router.delete("/:id", verifyJWT, articleController.deleteArticle);

router.put("/:id", verifyJWT, articleController.updateArticle);

module.exports = router;
