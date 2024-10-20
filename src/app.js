// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const connectDB = require("./config/database");

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", productRoutes);

// Server listening
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

connectDB()
  .then(() => {
    console.log("Connected to the database");
    app.listen(port, () => {
      console.log("Server is running on port 4000 ");
    });
  })

  .catch((err) => {
    console.error(err.message);
  });
