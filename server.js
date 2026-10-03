const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const itemRoutes = require("./itemRoutes");
const movementRoutes = require("./movementRoutes");
const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Inventory Management API is running!"
  });
});

app.use("/api/items", itemRoutes);
app.use("/api/movements", movementRoutes);
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
  });