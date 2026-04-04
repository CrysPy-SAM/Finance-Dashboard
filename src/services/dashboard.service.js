const Record = require("../models/record.model");

// 🔹 Helper: role-based filter
const buildMatchFilter = (user) => {
  const filter = { isDeleted: false };

  if (user.role !== "admin") {
    filter.createdBy = user._id;
  }

  return filter;
};

/**
 * Returns total income, total expense, and net balance.
 */
const getOverallSummary = async (user) => {
  const match = buildMatchFilter(user);

  const result = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  result.forEach(({ _id, total, count }) => {
    if (_id === "income") {
      totalIncome = total;
      incomeCount = count;
    } else {
      totalExpense = total;
      expenseCount = count;
    }
  });

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    totalRecords: incomeCount + expenseCount,
    incomeCount,
    expenseCount,
  };
};

/**
 * Returns per-category totals broken down by income/expense.
 */
const getCategoryBreakdown = async (user) => {
  const match = buildMatchFilter(user);

  const results = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.category",
        breakdown: {
          $push: {
            type: "$_id.type",
            total: "$total",
            count: "$count",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map(({ _id, breakdown }) => ({
    category: _id,
    breakdown,
  }));
};

/**
 * Returns month-wise income and expense totals for a given year.
 */
const getMonthlyTrends = async (year, user) => {
  const match = buildMatchFilter(user);
  const targetYear = year ? Number(year) : new Date().getFullYear();

  const results = await Record.aggregate([
    {
      $match: {
        ...match,
        date: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  const monthMap = {};

  results.forEach(({ _id, total, count }) => {
    const month = _id.month;

    if (!monthMap[month]) {
      monthMap[month] = {
        month,
        income: 0,
        expense: 0,
        incomeCount: 0,
        expenseCount: 0,
      };
    }

    monthMap[month][_id.type] = total;
    monthMap[month][`${_id.type}Count`] = count;
  });

  return Object.values(monthMap).sort((a, b) => a.month - b.month);
};

/**
 * Returns the most recent N records
 */
const getRecentActivity = async (limit = 5, user) => {
  const filter = buildMatchFilter(user);

  return Record.find(filter)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(Number(limit));
};

/**
 * Returns weekly totals for the past 8 weeks.
 */
const getWeeklyTrends = async (user) => {
  const match = buildMatchFilter(user);

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const results = await Record.aggregate([
    {
      $match: {
        ...match,
        date: { $gte: eightWeeksAgo },
      },
    },
    {
      $group: {
        _id: {
          week: { $week: "$date" },
          year: { $year: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
  ]);

  return results;
};

module.exports = {
  getOverallSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
  getWeeklyTrends,
};