const axios = require("axios");
const ProductTransaction = require("../models/ProductTransaction");

const seedDatabase = async (req, res) => {
  try {
    // Fetch the data from the third-party API
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );

    const data = response.data;

    // Remove all existing records
    await ProductTransaction.deleteMany({});

    // Insert new records fetched from the API
    await ProductTransaction.insertMany(data);

    res.status(200).send("Database seeding completed");

    console.log("Database seeding completed");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error seeding database", details: error.message });
  }
};

module.exports = { seedDatabase };
