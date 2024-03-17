// routes/favoriteRoutes.js
const express = require('express');
const { authenticateToken } = require("../middleware/authMiddleware");
const Favorite = require("../models/Favorite");
const Product = require("../models/Product");
const router = express.Router();

// Middleware to ensure a user's favorites exist or create one if it does not
async function ensureFavorites(req, res, next) {
  try {
    let favorite = await Favorite.findOne({ userId: req.user.userId });
    if (!favorite) {
      favorite = new Favorite({ userId: req.user.userId, items: [] });
      await favorite.save();
    }
    req.favorite = favorite;
    next();
  } catch (error) {
    console.error("Error ensuring favorites exist:", error);
    return res.status(500).json({ message: "Error ensuring favorites exist", error: error.message });
  }
}

// Add item to favorites
router.post("/add", authenticateToken, ensureFavorites, async (req, res) => {
  const { productId } = req.body;
  const favorite = req.favorite;

  const productExists = await Product.findById(productId);
  if (!productExists) {
    return res.status(404).json({ message: "Product not found" });
  }

  const itemIndex = favorite.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex === -1) {
    // Product not in favorites, add it
    favorite.items.push({ productId });
    await favorite.save();
    res.json(favorite);
  } else {
    // Product already in favorites, no need to add again
    res.status(400).json({ message: "Product already in favorites" });
  }
});

// Get the user's favorites
router.get("/", authenticateToken, ensureFavorites, async (req, res) => {
  const favorite = await Favorite.findOne({ userId: req.user.userId }).populate("items.productId");
  if (!favorite) {
    return res.status(404).json({ message: "Favorites not found" });
  }
  res.json(favorite);
});

// Remove an item from favorites
router.delete("/item/:productId", authenticateToken, ensureFavorites, async (req, res) => {
  const { productId } = req.params;
  const favorite = req.favorite;

  favorite.items = favorite.items.filter(item => item.productId.toString() !== productId);
  await favorite.save();
  res.json(favorite);
});

// At the top with other imports
const Cart = require("../models/Cart"); // Assuming this is the path to your Cart model

// New route to move favorites to the cart
router.post('/moveToCart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch the user's favorites and cart
    const favorites = await Favorite.findOne({ userId }).populate('items.productId');
    const cart = await Cart.findOne({ userId }) || new Cart({ userId, items: [], totalPrice: 0 });

    if (!favorites || favorites.items.length === 0) {
      return res.status(404).json({ message: "No favorites to move" });
    }

    // Loop through favorites to add them to the cart
    for (const item of favorites.items) {
      const product = item.productId; // Since favorites are populated
      const itemIndex = cart.items.findIndex(ci => ci.productId.toString() === product._id.toString());

      if (itemIndex > -1) {
        // Product already in the cart, update quantity if needed
        cart.items[itemIndex].quantity += 1; // Adjust as needed
      } else {
        // Product not in cart, add it
        cart.items.push({ productId: product._id, quantity: 1 }); // Adjust quantity as needed
      }
    }

    // Calculate the total price
    let totalPrice = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      totalPrice += product.price * item.quantity;
    }
    cart.totalPrice = totalPrice;

    await cart.save();

    // Clear the favorites after moving them to the cart
    await Favorite.updateOne({ userId }, { $set: { items: [] } });

    res.json({ message: "Favorites moved to cart successfully" });
  } catch (error) {
    console.error("Error moving favorites to cart:", error);
    res.status(500).json({ message: "Error moving favorites to cart", error: error.message });
  }
});


module.exports = router;
