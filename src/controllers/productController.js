// controllers/productController.js
const ProductTransaction = require("../models/ProductTransaction");

// Get all transactions with pagination and search
// controllers/productController.js

const getAllTransactions = async (req, res) => {
  const { page = 1, perPage = 10, search = "" } = req.query;

  let query = {
    $or: [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
    ],
  };

  // Check if the search is a valid number (for price search)
  if (!isNaN(search)) {
    query.$or.push({ price: Number(search) });
  }

  try {
    const transactions = await ProductTransaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));
    const total = await ProductTransaction.countDocuments(query);

    res.status(200).json({
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
      transactions,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching transactions", details: error.message });
  }
};

// Get statistics for a specific month
const getStatistics = async (req, res) => {
  const { month } = req.query;
  try {
    const startDate = new Date(`${month} 1`);
    const endDate = new Date(`${month} 31`);

    const soldItems = await ProductTransaction.find({
      dateOfSale: { $gte: startDate, $lte: endDate },
      sold: true,
    });
    const notSoldItems = await ProductTransaction.find({
      dateOfSale: { $gte: startDate, $lte: endDate },
      sold: false,
    });

    const totalSaleAmount = soldItems.reduce(
      (sum, item) => sum + item.price,
      0
    );
    const totalSoldItems = soldItems.length;
    const totalNotSoldItems = notSoldItems.length;

    res
      .status(200)
      .json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching statistics", details: error.message });
  }
};

// Get bar chart data (price range) for a specific month
const getBarChart = async (req, res) => {
  const { month } = req.query;
  try {
    const startDate = new Date(`${month} 1`);
    const endDate = new Date(`${month} 31`);

    const transactions = await ProductTransaction.find({
      dateOfSale: { $gte: startDate, $lte: endDate },
    });

    const priceRanges = {
      "0-100": 0,
      "101-200": 0,
      "201-300": 0,
      "301-400": 0,
      "401-500": 0,
      "501-600": 0,
      "601-700": 0,
      "701-800": 0,
      "801-900": 0,
      "901-above": 0,
    };

    transactions.forEach(({ price }) => {
      if (price <= 100) priceRanges["0-100"]++;
      else if (price <= 200) priceRanges["101-200"]++;
      else if (price <= 300) priceRanges["201-300"]++;
      else if (price <= 400) priceRanges["301-400"]++;
      else if (price <= 500) priceRanges["401-500"]++;
      else if (price <= 600) priceRanges["501-600"]++;
      else if (price <= 700) priceRanges["601-700"]++;
      else if (price <= 800) priceRanges["701-800"]++;
      else if (price <= 900) priceRanges["801-900"]++;
      else priceRanges["901-above"]++;
    });

    res.status(200).json(priceRanges);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching bar chart data", details: error.message });
  }
};

// Get pie chart data (categories) for a specific month
const getPieChart = async (req, res) => {
  const { month } = req.query;
  try {
    const startDate = new Date(`${month} 1`);
    const endDate = new Date(`${month} 31`);

    const transactions = await ProductTransaction.find({
      dateOfSale: { $gte: startDate, $lte: endDate },
    });

    const categoryCounts = transactions.reduce((acc, { category }) => {
      acc[category] = acc[category] ? acc[category] + 1 : 1;
      return acc;
    }, {});

    res.status(200).json(categoryCounts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching pie chart data", details: error.message });
  }
};

// Get combined data (all 3 APIs)
const getCombinedData = async (req, res) => {
  try {
    const transactions = await getAllTransactions(req, res);
    const statistics = await getStatistics(req, res);
    const barChart = await getBarChart(req, res);
    const pieChart = await getPieChart(req, res);

    res.status(200).json({
      transactions: transactions.transactions,
      statistics,
      barChart,
      pieChart,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching combined data", details: error.message });
  }
};

module.exports = {
  getAllTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData,
};
