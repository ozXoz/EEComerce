const express = require("express");
const Attribute = require("../models/Attribute"); // Adjust the path according to your project structure
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

// Add or update an attribute with its values
router.post("/add", authenticateToken, isAdmin, async (req, res) => {
  const { key, values } = req.body;
  try {
    let attribute = await Attribute.findOne({ key });
    if (attribute) {
      // Update existing attribute with new values
      attribute.values = values;
    } else {
      // Or create a new attribute
      attribute = new Attribute({ key, values });
    }
    await attribute.save();
    res.status(201).json(attribute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an attribute
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { values } = req.body;
    try {
      let attribute = await Attribute.findById(id);
      if (!attribute) {
        return res.status(404).json({ message: "Attribute not found" });
      }
      attribute.values = values;
      await attribute.save();
      res.json(attribute);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  

// List all attributes
router.get("/all", authenticateToken, isAdmin, async (req, res) => {
  try {
    const attributes = await Attribute.find();
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an attribute
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Attribute.findByIdAndDelete(id);
    res.json({ message: "Attribute deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
