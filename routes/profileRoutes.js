const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profilesController");
const { verifyJWT } = require("../middleware/verifyJWT");
const { verifyJWTOptional } = require("../middleware/verifyJWTOptional");

// Get profile - authentication optional
router.get("/:username", verifyJWTOptional, profileController.getProfile);

// Toggle follow status (both follow and unfollow in one endpoint)
router.post("/:username/follow", verifyJWT, profileController.toggleFollow);

module.exports = router;