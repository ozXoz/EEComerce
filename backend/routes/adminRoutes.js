const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Example admin route
router.get('/admin/dashboard', authenticateToken, isAdmin, (req, res) => {
  res.send('Admin Dashboard - Access Granted');
});

module.exports = router;
