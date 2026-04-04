const express = require("express");
const { body } = require("express-validator");
const {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getRecordOptions,
} = require("../controllers/record.controller");
const { protect } = require("../middleware/auth.middleware");
const { restrictTo } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);

const createRecordValidation = [
  body("amount")
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("type")
    .isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'"),
  body("category")
    .notEmpty().withMessage("Category is required"),
  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("notes")
    .optional()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

const updateRecordValidation = [
  body("amount")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("type")
    .optional()
    .isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'"),
  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("notes")
    .optional()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];


router.get("/meta/options", getRecordOptions);

router.get("/", restrictTo("viewer", "analyst", "admin"), getAllRecords);
router.get("/:id", restrictTo("viewer", "analyst", "admin"), getRecordById);

router.post("/", restrictTo("admin"), createRecordValidation, createRecord);
router.patch("/:id", restrictTo("admin"), updateRecordValidation, updateRecord);
router.delete("/:id", restrictTo("admin"), deleteRecord);

module.exports = router;