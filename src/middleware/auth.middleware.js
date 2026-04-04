const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { AppError, catchAsync } = require("../utils/error");

const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required. Please log in.", 401));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Session expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid token. Please log in again.", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User belonging to this token no longer exists.", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated. Contact an admin.", 403));
  }

  req.user = user;
  next();
});

module.exports = { protect };