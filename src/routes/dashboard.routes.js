const express = require("express");
const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
} = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");
const { restrictTo } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect, restrictTo("analyst", "admin"));

router.get("/summary", getSummary);
router.get("/categories", getCategoryBreakdown);
router.get("/trends/monthly", getMonthlyTrends);
router.get("/trends/weekly", getWeeklyTrends);
router.get("/activity", getRecentActivity);

module.exports = router;