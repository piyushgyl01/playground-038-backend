const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");
const { verifyJWT } = require("../middleware/verifyJWT");

// Authentication
router.post("/users/login", userController.userLogin);

// Registration
router.post("/users", userController.registerUser);

// Get Current User
router.get("/user", verifyJWT, userController.getCurrentUser);

// Update User
router.put("/user", verifyJWT, userController.updateUser);

//Refresh Token
router.post("/user/refresh-token", userController.refreshToken);

//Logout
router.post("/users/logout", userController.logout)

module.exports = router;
