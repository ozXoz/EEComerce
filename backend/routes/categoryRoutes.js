const express = require("express");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const Category = require("../models/Category");
const Department = require("../models/Department");
const router = express.Router();

// Add a new category
router.post("/add", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, departmentId } = req.body;

    // Check if department exists
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res.status(404).send("Department not found");
    }

    const category = new Category({
      name,
      description,
      department: departmentId,
    });
    await category.save();
    res.status(201).send("Category created successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get all categories
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
    try {
      const categories = await Category.find().populate('department', 'name -_id');
      res.json(categories);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });


// Get categories by department ID
router.get('/by-department/:departmentId', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { departmentId } = req.params;
      const categories = await Category.find({ department: departmentId }).populate('department', 'name -_id');
      res.json(categories);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

// Get a single category by ID
router.get("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).send("Category not found");
    }
    res.json(category);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update a category
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).send("Category not found");
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Delete a category
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).send("Category not found");
    }
    res.send("Category deleted successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
