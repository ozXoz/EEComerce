const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const Department = require('../models/Department');
const router = express.Router();

// Create a new department
router.post('/add', authenticateToken, isAdmin, async (req, res) => {
  try {
    const department = new Department({
      name: req.body.name,
      description: req.body.description,
    });
    await department.save();
    res.status(201).send('Department created successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get all departments
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get a single department by ID
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).send('Department not found');
    }
    res.json(department);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update a department
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const updatedDepartment = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDepartment);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Delete a department
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.send('Department deleted successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
