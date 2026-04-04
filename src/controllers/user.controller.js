const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const { AppError, catchAsync, sendSuccess } = require("../utils/error");

// ─── GET ALL USERS ────────────────────────────────────────────────────────────
exports.getAllUsers = catchAsync(async (req, res) => {
  const { role, isActive, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Users fetched successfully", {
    users,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─── GET USER BY ID ───────────────────────────────────────────────────────────
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  sendSuccess(res, 200, "User fetched successfully", { user: user.toSafeObject() });
});

// ─── UPDATE USER ROLE ─────────────────────────────────────────────────────────
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map((e) => e.msg).join(", ");
    return next(new AppError(msg, 422));
  }

  // Prevent admin from demoting themselves
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError("You cannot change your own role", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  sendSuccess(res, 200, "User role updated successfully", { user: user.toSafeObject() });
});

// ─── UPDATE USER STATUS (activate / deactivate) ───────────────────────────────
exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return next(new AppError("isActive must be a boolean (true or false)", 422));
  }

  // Prevent admin from deactivating themselves
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError("You cannot change your own status", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const statusMsg = isActive ? "activated" : "deactivated";
  sendSuccess(res, 200, `User ${statusMsg} successfully`, { user: user.toSafeObject() });
});

// ─── DELETE USER ──────────────────────────────────────────────────────────────
exports.deleteUser = catchAsync(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError("You cannot delete your own account", 400));
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  sendSuccess(res, 200, "User deleted successfully");
});