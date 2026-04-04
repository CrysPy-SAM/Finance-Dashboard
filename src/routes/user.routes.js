const express = require("express");
const { body } = require("express-validator");
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { restrictTo } = require("../middleware/role.middleware");

const router = express.Router();

// All user management routes are admin-only
router.use(protect, restrictTo("admin"));

const roleValidation = [
  body("role")
    .isIn(["viewer", "analyst", "admin"])
    .withMessage("Role must be one of: viewer, analyst, admin"),
];

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id/role", roleValidation, updateUserRole);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

module.exports = router;