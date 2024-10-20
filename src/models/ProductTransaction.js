const mongoose = require("mongoose");

const productTransactionsSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  sold: Boolean,
  category: String,
  image: String,
});

module.exports = mongoose.model(
  "ProductTransaction",
  productTransactionsSchema
);
