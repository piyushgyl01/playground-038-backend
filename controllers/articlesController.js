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
  const userId = req.userId;

  const { article } = req.body;

  const { slug } = req.params;

  const loginUser = await User.findById(userId).exec();

  const target = await Article.findOne({ slug }).exec();

  // console.log(target.title);
  // console.log(req.userId);
  if (article.title) {
    target.title = article.title;
  }
  if (article.description) {
    target.description = article.description;
  }
  if (article.body) {
    target.body = article.body;
  }
  if (article.tagList) {
    target.tagList = article.tagList;
  }

  await target.save();
  return res.status(200).json({
    article: await target.toArticleResponse(loginUser),
  });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const id = req.userId;

  const { slug } = req.params;

  const loginUser = await User.findById(id).exec();

  if (!loginUser) {
    return res.status(401).json({
      message: "User Not Found",
    });
  }

  const article = await Article.findOne({ slug }).exec();

  if (!article) {
    return res.status(401).json({
      message: "Article Not Found",
    });
  }
  // console.log(`article info ${article}`);

  await loginUser.favorite(article._id);

  const updatedArticle = await article.updateFavoriteCount();

  return res.status(200).json({
    article: await updatedArticle.toArticleResponse(loginUser),
  });
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
};
