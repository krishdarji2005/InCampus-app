const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  googleAuth,
  getUserProfile, // Add this
} = require("../controller/userController");

const router = express.Router();

router.get("/", getAllUsers);
router.get("/profile", getUserProfile); // Add this before /:id route
router.get("/:id", getUserById);
router.post("/", createUser);
router.post("/google-auth", googleAuth);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;