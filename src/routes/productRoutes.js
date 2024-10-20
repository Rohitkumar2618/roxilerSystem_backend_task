const express = require("express");
const router = express.Router();
const Transaction = require("../models/ProductTransaction"); // Assuming you have a Transaction model
const { seedDatabase } = require("../controllers/seedController");
router.get("/seed", seedDatabase);

// Fetch transactions with optional search and month filters
router.get("/transactions", async (req, res) => {
  try {
    const { month, search } = req.query;
    const query = {};

    // Filtering by month
    if (month) {
      query.dateOfSale = {
        $gte: new Date(2021, month - 1, 1),
        $lt: new Date(2021, month, 1),
      };
    }

    // Searching by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { price: { $regex: search, $options: "i" } },
      ];
    }

    const transactions = await Transaction.find(query);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch statistics for a specific month
router.get("/statistics", async (req, res) => {
  try {
    const { month } = req.query;

    const query = {
      dateOfSale: {
        $gte: new Date(2021, month - 1, 1),
        $lt: new Date(2021, month, 1),
      },
    };

    const transactions = await Transaction.find(query);

    const totalSale = transactions.reduce(
      (sum, transaction) => sum + transaction.price,
      0
    );
    const totalSoldItems = transactions.filter(
      (transaction) => transaction.sold
    ).length;
    const totalNotSoldItems = transactions.filter(
      (transaction) => !transaction.sold
    ).length;

    res.json({ totalSale, totalSoldItems, totalNotSoldItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch bar chart data (price range and transaction count)
router.get("/bar-chart", async (req, res) => {
  try {
    const { month } = req.query;
    const query = {
      dateOfSale: {
        $gte: new Date(2021, month - 1, 1),
        $lt: new Date(2021, month, 1),
      },
    };

    const transactions = await Transaction.find(query);

    // Define price ranges
    const ranges = [
      { label: "0-100", min: 0, max: 100 },
      { label: "101-200", min: 101, max: 200 },
      { label: "201-300", min: 201, max: 300 },
      { label: "301-400", min: 301, max: 400 },
      { label: "401-500", min: 401, max: 500 },
      { label: "501-600", min: 501, max: 600 },
      { label: "601-700", min: 601, max: 700 },
      { label: "701-800", min: 701, max: 800 },
    ];

    // Count transactions in each price range
    const data = ranges.map((range) => {
      const count = transactions.filter(
        (transaction) =>
          transaction.price >= range.min && transaction.price <= range.max
      ).length;
      return { range: range.label, count };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
