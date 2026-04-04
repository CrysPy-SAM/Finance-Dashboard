const dashboardService = require("../services/dashboard.service");
const { catchAsync, sendSuccess } = require("../utils/error");

/**
 * GET /api/dashboard/summary
 */
const getSummary = catchAsync(async (req, res) => {
  const summary = await dashboardService.getOverallSummary(req.user);

  sendSuccess(res, 200, "Dashboard summary fetched successfully.", {
    summary,
  });
});

/**
 * GET /api/dashboard/categories
 */
const getCategoryBreakdown = catchAsync(async (req, res) => {
  const breakdown = await dashboardService.getCategoryBreakdown(req.user);

  sendSuccess(res, 200, "Category breakdown fetched successfully.", {
    breakdown,
  });
});

/**
 * GET /api/dashboard/trends/monthly?year=2024
 */
const getMonthlyTrends = catchAsync(async (req, res) => {
  const { year } = req.query;

  const trends = await dashboardService.getMonthlyTrends(
    year,
    req.user
  );

  sendSuccess(res, 200, "Monthly trends fetched successfully.", {
    trends,
  });
});

/**
 * GET /api/dashboard/trends/weekly
 */
const getWeeklyTrends = catchAsync(async (req, res) => {
  const trends = await dashboardService.getWeeklyTrends(req.user);

  sendSuccess(res, 200, "Weekly trends fetched successfully.", {
    trends,
  });
});

/**
 * GET /api/dashboard/activity?limit=5
 */
const getRecentActivity = catchAsync(async (req, res) => {
  const { limit } = req.query;

  const activity = await dashboardService.getRecentActivity(
    limit,
    req.user
  );

  sendSuccess(res, 200, "Recent activity fetched successfully.", {
    activity,
  });
});

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
};