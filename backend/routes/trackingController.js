const Tracking = require('../models/Tracking');
const Order = require('../models/Order');

exports.addTrackingToOrder = async (req, res) => {
  const { orderId } = req.params;
  // Assuming the user ID is coming from the authenticated user's data
  const trackingData = { ...req.body, orderId, user: req.user.id };

  try {
    const tracking = new Tracking(trackingData);
    const savedTracking = await tracking.save();

    await Order.findByIdAndUpdate(orderId, { $set: { tracking: savedTracking._id } });

    res.status(201).json(savedTracking);
  } catch (error) {
    res.status(500).json({ message: "Failed to add tracking information", error });
  }
};


exports.getTrackingInfo = async (req, res) => {
  const { trackingId } = req.params;

  try {
    const tracking = await Tracking.findById(trackingId);
    res.status(200).json(tracking);
  } catch (error) {
    res.status(500).json({ message: "Failed to get tracking information", error });
  }
};

exports.getUserTrackingInfo = async (req, res) => {
  try {
    // Updated to use req.user.userId based on the JWT token payload structure
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found" });
    }

    // Fetch orders that belong to the logged-in user
    const userOrders = await Order.find({ userId: userId }).select("_id");
    if (userOrders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    const orderIds = userOrders.map((order) => order._id);

    // Fetch tracking information for those orders
    const trackingInfo = await Tracking.find({ orderId: { $in: orderIds } });

    res.status(200).json(trackingInfo);
  } catch (error) {
    res.status(500).json({ message: "Failed to get tracking information", error });
  }
};




exports.updateTrackingInfo = async (req, res) => {
  const { trackingId } = req.params;
  const updates = req.body;

  try {
    const updatedTracking = await Tracking.findByIdAndUpdate(trackingId, updates, { new: true });
    res.status(200).json(updatedTracking);
  } catch (error) {
    res.status(500).json({ message: "Failed to update tracking information", error });
  }
};
