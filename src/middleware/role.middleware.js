const { AppError } = require("../utils/error");

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role(s): ${allowedRoles.join(", ")}.`,
          403
        )
      );
    }

    next();
  };
};

// authorizeRoles 
const authorizeRoles = restrictTo;

module.exports = { restrictTo, authorizeRoles };