const mongoose = require("mongoose");

const movementSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    itemId: {
      type: String,
      required: true,
      trim: true
    },

    itemName: {
      type: String,
      trim: true
    },

    type: {
      type: String,
      required: true,
      enum: ["In", "Out"]
    },

    qty: {
      type: Number,
      required: true,
      min: 1
    },

    date: {
      type: Date,
      required: true,
      default: Date.now
    },

    supplier: {
      type: String,
      trim: true
    },

    note: {
      type: String,
      trim: true
    },

    reason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Movement", movementSchema);