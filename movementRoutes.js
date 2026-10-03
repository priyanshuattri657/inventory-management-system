const express = require("express");
const Movement = require("./movement");

const router = express.Router();

// GET all movements
router.get("/", async (req, res) => {
  try {
    const movements = await Movement.find().sort({ createdAt: -1 });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET one movement
router.get("/:id", async (req, res) => {
  try {
    const movement = await Movement.findById(req.params.id);

    if (!movement) {
      return res.status(404).json({ message: "Movement not found" });
    }

    res.json(movement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD movement
router.post("/", async (req, res) => {
  try {
    const movement = new Movement(req.body);
    const savedMovement = await movement.save();

    res.status(201).json(savedMovement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE movement
router.delete("/:id", async (req, res) => {
  try {
    const movement = await Movement.findByIdAndDelete(req.params.id);

    if (!movement) {
      return res.status(404).json({ message: "Movement not found" });
    }

    res.json({ message: "Movement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;