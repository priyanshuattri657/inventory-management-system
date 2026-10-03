const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    unit: {
      type: String,
      required: true,
      default: "pcs"
    },

    qty: {
      type: Number,
      required: true,
      min: 0
    },

    reorderLevel: {
      type: Number,
      required: true,
      min: 0
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    supplier: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Item", itemSchema);