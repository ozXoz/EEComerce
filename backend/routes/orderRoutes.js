const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { authenticateToken,isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('items.productId');
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});
router.get('/displayUserOrderHistory', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId }).populate('items.productId');
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user's order history:", error);
    res.status(500).json({ message: "Failed to fetch order history" });
  }
});
// Create an order from a cart
router.post('/create', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Create order items array from the cart items
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      image: item.productId.image,
      price: item.productId.price,
      quantity: item.quantity
    }));

    // Calculate total price from cart
    const totalPrice = cart.totalPrice;

    // Create a new order instance
    const order = new Order({
      userId,
      username: req.user.username,
      email: req.user.email,
      items: orderItems,
      totalPrice,
      paymentStatus: 'pending'
    });

    // Save the order to the database
    const savedOrder = await order.save();
    console.log("Order saved:", savedOrder); // Log the saved order for debugging

    // Clear the user's cart
    await Cart.findOneAndDelete({ userId });

    // Send the created order in the response
    res.status(201).json(savedOrder);
  } catch (error) {
    // Handle errors
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// update order status 
// Update order status
router.put('/updateStatus/:orderId', authenticateToken, isAdmin, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // Assuming the new status is passed in the request body

  try {
    // Ensure the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status
    order.paymentStatus = status;
    const updatedOrder = await order.save();

    // Send the updated order in the response
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});



module.exports = router;
