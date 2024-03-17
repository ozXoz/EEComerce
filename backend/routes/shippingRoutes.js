// shippingRoutes.js

const express = require("express");
const router = express.Router();
const { authenticateToken,isAdmin } = require("../middleware/authMiddleware"); // Import authentication middleware if needed
const Shipping = require("../models/Shipping"); // Import your Shipping model

// Route for submitting shipping information
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { address, province, postalCode, country } = req.body;

    // Create a new shipping instance
    const shippingInfo = new Shipping({
      userId: req.user.userId, // Assuming you have a userId associated with the user
      address,
      province,
      postalCode,
      country,
    });

    // Save the shipping information to the database
    const savedShippingInfo = await shippingInfo.save();

    res.status(201).json(savedShippingInfo);
  } catch (error) {
    console.error("Error submitting shipping information:", error);
    res.status(500).json({ message: "Failed to submit shipping information" });
  }
});

// New route for getting all shipping information
router.get("/all", authenticateToken, isAdmin, async (req, res) => {
  try {
    // Assuming 'userId' is the reference to the User model in your Shipping schema
    const allShippingInfo = await Shipping.find({}).populate('userId', 'username email');
    res.status(200).json(allShippingInfo);
  } catch (error) {
    console.error("Error retrieving all shipping information:", error);
    res.status(500).json({ message: "Failed to retrieve shipping information" });
  }
});


module.exports = router;
