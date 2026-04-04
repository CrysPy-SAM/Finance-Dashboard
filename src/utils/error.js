class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const catchAsync = (fn) => {
  return async (req, res, next) => {
    console.log("👉 NEXT TYPE:", typeof next);

    try {
      await fn(req, res, next);
    } catch (err) {
      console.error("🔥 ERROR:", err);
      next(err);
    }
  };
};


const sendSuccess = (res, statusCode, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

module.exports = { AppError, catchAsync, sendSuccess };