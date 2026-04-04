const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { AppError, catchAsync, sendSuccess } = require("../utils/error");

// 🔹 helper
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// 🔹 REGISTER
const { validationResult } = require("express-validator");

const register = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join(", ");
    return next(new AppError(msg, 422));
  }

  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already exists", 409));
  }

  const user = await User.create({ name, email, password });

  const token = signToken(user._id);

  sendSuccess(res, 201, "Account created", {
    token,
    user: user.toSafeObject(),
  });
});
// 🔹 LOGIN
const login = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map(e => e.msg).join(", ");
    return next(new AppError(msg, 422));
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Account deactivated", 403));
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);

  sendSuccess(res, 200, "Login successful", {
    token,
    user: user.toSafeObject(),
  });
});
// 🔹 GET ME
const getMe = catchAsync(async (req, res, next) => {
  sendSuccess(res, 200, "Profile fetched", {
    user: req.user.toSafeObject(),
  });
});

module.exports = { register, login, getMe };