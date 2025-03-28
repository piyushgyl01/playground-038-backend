const Article = require("../models/Article");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

const createArticle = asyncHandler(async (req, res) => {
  const { title, description, body, tagList } = req.body;

  // confirm data
  if (!title || !description || !body) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const id = req.user.id;

  try {
    const newArticle = new Article({
      title,
      description,
      body,
      tagList,
      author: id,
    });

    const savedAricle = await newArticle.save();

    res
      .status(201)
      .json({ message: "Article created successfully", article: savedAricle });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating article", error: error.message });
  }
});

const deleteArticle = asyncHandler(async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }

    if (article.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the author can delete his article" });
    }

    await Article.findByIdAndDelete(req.params.id);

    res.json({ message: "Article deleted successfully", article: article });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting article", error: error.message });
  }
});

const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return res.status(404).json({ message: "Article not found." });
  }

  if (article.author.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Only the author can edit his article" });
  }

  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json({
      message: "Article updated successfully",
      article: updatedArticle,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating article", error: error.message });
  }
});

const allArticles = asyncHandler(async (req, res) => {
  try {
    const articles = await Article.find().populate(
      "author",
      "name username image"
    );
    res.json({ articles });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting articles", error: error.message });
  }
});

const singleArticle = asyncHandler(async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      "author",
      "name username image"
    );
    res.json({ article });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting articles", error: error.message });
  }
});

const toggleFavorite = asyncHandler(async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the article is already favorited
    const isAlreadyFavorited =
      user.favouriteArticles && user.favouriteArticles.includes(article._id);

    if (isAlreadyFavorited) {
      // Remove from favorites
      user.favouriteArticles = user.favouriteArticles.filter(
        (articleId) => articleId.toString() !== article._id.toString()
      );
      article.favouritesCount = Math.max(0, article.favouritesCount - 1);
    } else {
      // Add to favorites
      if (!user.favouriteArticles) user.favouriteArticles = [];
      user.favouriteArticles.push(article._id);
      article.favouritesCount = (article.favouritesCount || 0) + 1;
    }

    await user.save();
    await article.save();

    res.json({
      article: {
        ...article.toObject(),
        favorited: !isAlreadyFavorited,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling favorite", error: error.message });
  }
});

const getArticleWithSlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const article = await Article.findOne({ slug }).exec();

  if (!article) {
    return res.status(401).json({
      message: "Article Not Found",
    });
  }

  return res.status(200).json({
    article: await article.toArticleResponse(false),
  });
});

const feedArticles = asyncHandler(async (req, res) => {
  let limit = 20;
  let offset = 0;

  if (req.query.limit) {
    limit = req.query.limit;
  }

  if (req.query.offset) {
    offset = req.query.offset;
  }

  const userId = req.userId;

  const loginUser = await User.findById(userId).exec();

  // console.log(loginUser.followingUsers)

  // confirm data

  const filteredArticles = await Article.find({
    author: { $in: loginUser.followingUsers },
  })
    .limit(Number(limit))
    .skip(Number(offset))
    .exec();

  // console.log(`articles: ${filteredArticles}`);
  const articleCount = await Article.count({
    author: { $in: loginUser.followingUsers },
  });

  return res.status(200).json({
    articles: await Promise.all(
      filteredArticles.map(async (article) => {
        return await article.toArticleResponse(loginUser);
      })
    ),
    articlesCount: articleCount,
  });
});

const listArticles = asyncHandler(async (req, res) => {
  let limit = 20;
  let offset = 0;
  let query = {};
  if (req.query.limit) {
    limit = req.query.limit;
  }

  if (req.query.offset) {
    offset = req.query.offset;
  }
  if (req.query.tag) {
    query.tagList = { $in: [req.query.tag] };
  }

  if (req.query.author) {
    const author = await User.findOne({ username: req.query.author }).exec();
    if (author) {
      query.author = author._id;
    }
  }

  if (req.query.favorited) {
    const favoriter = await User.findOne({
      username: req.query.favorited,
    }).exec();
    if (favoriter) {
      query._id = { $in: favoriter.favouriteArticles };
    }
  }

  const filteredArticles = await Article.find(query)
    .limit(Number(limit))
    .skip(Number(offset))
    .sort({ createdAt: "desc" })
    .exec();

  const articleCount = await Article.count(query);

  if (req.loggedin) {
    const loginUser = await User.findById(req.userId).exec();
    return res.status(200).json({
      articles: await Promise.all(
        filteredArticles.map(async (article) => {
          return await article.toArticleResponse(loginUser);
        })
      ),
      articlesCount: articleCount,
    });
  } else {
    return res.status(200).json({
      articles: await Promise.all(
        filteredArticles.map(async (article) => {
          return await article.toArticleResponse(false);
        })
      ),
      articlesCount: articleCount,
    });
  }
});

module.exports = {
  createArticle,
  deleteArticle,
  toggleFavorite,
  getArticleWithSlug,
  updateArticle,
  feedArticles,
  listArticles,
  allArticles,
  singleArticle,
};
