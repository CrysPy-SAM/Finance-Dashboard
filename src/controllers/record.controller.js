const { validationResult } = require("express-validator");
const Record = require("../models/record.model");
const { AppError, catchAsync, sendSuccess } = require("../utils/error");

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createRecord = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map((e) => e.msg).join(", ");
    return next(new AppError(msg, 422));
  }

  const record = await Record.create({
    ...req.body,
    createdBy: req.user._id,
  });

  sendSuccess(res, 201, "Record created successfully", { record });
});

// ─── GET ALL (with filters + pagination) ──────────────────────────────────────
exports.getAllRecords = catchAsync(async (req, res, next) => {
  const {
    type,
    category,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;

  const filter = {};

  // Admin sees all records; others see only their own
  if (req.user.role !== "admin") {
    filter.createdBy = req.user._id;
  }

  if (type) filter.type = type;
  if (category) filter.category = category.toLowerCase();

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [records, total] = await Promise.all([
    Record.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Record.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Records fetched successfully", {
    records,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─── GET BY ID ────────────────────────────────────────────────────────────────
exports.getRecordById = catchAsync(async (req, res, next) => {
  const filter = { _id: req.params.id };

  if (req.user.role !== "admin") {
    filter.createdBy = req.user._id;
  }

  const record = await Record.findOne(filter).populate(
    "createdBy",
    "name email"
  );

  if (!record) {
    return next(new AppError("Record not found or access denied", 404));
  }

  sendSuccess(res, 200, "Record fetched successfully", { record });
});

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateRecord = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map((e) => e.msg).join(", ");
    return next(new AppError(msg, 422));
  }

  const filter = { _id: req.params.id };

  if (req.user.role !== "admin") {
    filter.createdBy = req.user._id;
  }

  // Prevent overwriting createdBy or isDeleted
  const { createdBy, isDeleted, ...safeBody } = req.body;

  const record = await Record.findOneAndUpdate(filter, safeBody, {
    new: true,
    runValidators: true,
  });

  if (!record) {
    return next(new AppError("Record not found or access denied", 404));
  }

  sendSuccess(res, 200, "Record updated successfully", { record });
});

// ─── DELETE (soft delete) ─────────────────────────────────────────────────────
exports.deleteRecord = catchAsync(async (req, res, next) => {
  const filter = { _id: req.params.id, isDeleted: false };

  if (req.user.role !== "admin") {
    filter.createdBy = req.user._id;
  }

  const result = await Record.updateOne(filter, { isDeleted: true });

  if (result.matchedCount === 0) {
    return next(
      new AppError("Record not found or already deleted", 404)
    );
  }

  sendSuccess(res, 200, "Record deleted successfully");
});

// ─── META / OPTIONS ───────────────────────────────────────────────────────────
exports.getRecordOptions = catchAsync(async (req, res) => {
  sendSuccess(res, 200, "Record options fetched", {
    types: Record.TYPES,
    categories: Record.CATEGORIES,
  });
});