const mongoose = require("mongoose");

const RECORD_TYPES = Object.freeze(["income", "expense"]);

const CATEGORIES = Object.freeze([
  "salary",
  "freelance",
  "investment",
  "food",
  "transport",
  "utilities",
  "entertainment",
  "health",
  "education",
  "rent",
  "other",
]);

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: RECORD_TYPES,
        message: "Type must be 'income' or 'expense'",
      },
    },
    category: {
  type: String,
  required: [true, "Category is required"],
  trim: true,
  lowercase: true,
  enum: {
    values: CATEGORIES,
    message: `Category must be one of: ${CATEGORIES.join(", ")}`,
  },
},
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Always exclude soft-deleted records unless explicitly asked
recordSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
  next();
});

recordSchema.statics.TYPES = RECORD_TYPES;
recordSchema.statics.CATEGORIES = CATEGORIES;

const Record = mongoose.model("Record", recordSchema);

module.exports = Record;