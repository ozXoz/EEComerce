const express = require("express");
const router = express.Router();
const {
  addTrackingToOrder,
  getTrackingInfo,
  updateTrackingInfo,
  getUserTrackingInfo
} = require("./trackingController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const Tracking = require("../models/Tracking");
const Order = require("../models/Order");

// Add tracking information (Admin only)
router.post(
  "/admin/orders/:orderId/tracking",
  authenticateToken,
  isAdmin,
  addTrackingToOrder
);

// Update tracking information (Admin only)
router.put(
  "/admin/tracking/:trackingId",
  authenticateToken,
  isAdmin,
  updateTrackingInfo
);

// Get tracking information (User & Admin)
router.get("/tracking/:trackingId", authenticateToken, getTrackingInfo);

// Get all tracking information (public)
// Get tracking information specific to the logged-in user
// router.get("/user/tracking", authenticateToken, async (req, res) => {
//   try {
//     console.log("Headers:", req.headers); // Log the headers to check the Authorization token
//     const userId = req.user.id; // Ensure this is correctly extracting the user's ID from the authentication token
//     if (!userId) {
//       return res.status(400).json({ message: "User ID not found" });
//     }

//     console.log("Fetching user orders for user:", userId);

//     // Fetch orders that belong to the logged-in user
//     const userOrders = await Order.find({ userId: userId }).select("_id");
//     if (userOrders.length === 0) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     console.log("User orders found:", userOrders);

//     const orderIds = userOrders.map((order) => order._id);
//     console.log("Order IDs extracted:", orderIds);

//     // Fetch tracking information for those orders
//     const trackingInfo = await Tracking.find({ orderId: { $in: orderIds } });
//     console.log("Tracking info found:", trackingInfo);

//     res.status(200).json(trackingInfo);
//   } catch (error) {
//     console.error("Error in /user/tracking route:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to get tracking information", error });
//   }
// });

router.get("/user/tracking", authenticateToken, getUserTrackingInfo);

module.exports = router;
