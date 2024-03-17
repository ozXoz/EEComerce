const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");
const Product = require("../models/Product"); // Ensure this is correctly imported for product details
const router = express.Router();

// Middleware to ensure a user's cart exists or creates one if it does not
async function ensureCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      // Ensure that the userId is correctly passed when creating a new Cart instance
      cart = new Cart({ userId: req.user.userId, items: [] });
      await cart.save();
    }
    req.cart = cart;
    next();
  } catch (error) {
    console.error("Error ensuring cart exists:", error);
    return res
      .status(500)
      .json({ message: "Error ensuring cart exists", error: error.message });
  }
}

// Add item to cart BURAYA BENIM PRODUCT PICTURES ,
// Add item to cart
// Sepete ürün ekleme route'u
router.post("/add", authenticateToken, ensureCart, async (req, res) => {
  try {
    const { productId, quantity: requestedQuantity } = req.body;

    // Validate the product exists
    const product = await Product.findById(productId).select('productQuantity price'); // Only fetch necessary fields
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check stock availability
    if (product.productQuantity < requestedQuantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    const cart = req.cart;
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    // Update or add product in the cart
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += requestedQuantity;
    } else {
      cart.items.push({ productId, quantity: requestedQuantity });
    }

    // Update the product's stock
    product.productQuantity -= requestedQuantity;
    await product.save();

    // Recalculate cart's total price
    const updatedCartItems = await Promise.all(cart.items.map(async (item) => {
      const itemProduct = await Product.findById(item.productId).select('price');
      return item.quantity * itemProduct.price;
    }));
    const totalPrice = updatedCartItems.reduce((acc, curr) => acc + curr, 0);

    cart.totalPrice = totalPrice;
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Error adding item to cart", error: error.message });
  }
});


// Middleware to authenticate token and ensure a user's cart exists or creates one
async function findOrCreateCart(req, res, next) {
  try {
    // If using JWT and need to extract user info again
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Failed to authenticate token." });
    }

    let user = await User.findById(decoded.id); // Adjust based on how you set JWT payload
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({ userId: user._id, items: [], totalPrice: 0 });
      await cart.save();
    }
    req.cart = cart; // Attach the cart to the request object
    req.user = user; // Re-attach user object if needed downstream
    next();
  } catch (error) {
    console.error("Error in findOrCreateCart middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get the user's cart, including product details and total price
router.get("/all", authenticateToken, ensureCart, async (req, res) => {
  // Ensure consistent use of user identifier
  const cart = await Cart.findOne({ userId: req.user.userId }).populate(
    "items.productId"
  );

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  // Calculate total price
  // Calculate total price
  const totalPrice = cart.items.reduce((acc, item) => {
    // Check if item.productId exists and has a price before adding to the total
    if (item.productId && item.productId.price) {
      return acc + item.productId.price * item.quantity;
    } else {
      // Log a warning or handle the case where product details are missing
      console.warn("Invalid item or missing product details:", item);
      return acc;
    }
  }, 0);

  // Return the cart object with totalPrice, ensuring to call toObject() on a non-null value
  res.json({ ...cart.toObject(), totalPrice });
});

// Update item quantity in the cart
router.put(
  "/item/:productId",
  authenticateToken,
  ensureCart,
  async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body; // New quantity
    const cart = req.cart;

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  }
);

// Remove an item from the cart
// Remove an item from the cart
router.delete("/item/:productId", authenticateToken, ensureCart, async (req, res) => {
  const { productId } = req.params;
  const cart = req.cart;

  // Find the item in the cart
  const item = cart.items.find(item => item.productId.toString() === productId);
  if (!item) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  // Remove the item from the cart
  cart.items = cart.items.filter(item => item.productId.toString() !== productId);

  try {
    // Update the cart in the database
    await cart.save();

    // Find the product and increment its stock quantity
    const product = await Product.findById(productId);
    if (product) {
      product.productQuantity += item.quantity; // Increment the stock quantity by the removed quantity
      await product.save(); // Save the updated product
    }

    res.json(cart); // Return the updated cart
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
    res.status(500).json({ message: "Failed to remove item from cart", error: error.message });
  }
});


// Flexible routes for unauhraizte user to add cart ....
router.post("/cart/add", findOrCreateCart, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cart = req.cart;
    let itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Product already in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // New product, add to cart
      cart.items.push({ productId, quantity });
    }

    // Update total price
    let totalPrice = 0;
    for (let item of cart.items) {
      const product = await Product.findById(item.productId);
      totalPrice += product.price * item.quantity;
    }
    cart.totalPrice = totalPrice;

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res
      .status(500)
      .json({ message: "Error adding item to cart", error: error.message });
  }
});

/// flexible routes for view cart un auntrozie

router.get("/cart", findOrCreateCart, async (req, res) => {
  try {
    // Assuming req.cart has been populated by the middleware
    const cart = await Cart.findOne({ _id: req.cart._id }).populate(
      "items.productId"
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
});

router.post("/merge", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const guestCart = req.body.guestCart; // Extract guestCart from request body

  try {
    if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Guest cart is empty or undefined" });
    }

    let userCart = await Cart.findOne({ userId: userId });
    if (!userCart) {
      userCart = new Cart({ userId: userId, items: [], totalPrice: 0 });
    }

    // Merge guestCart items into userCart
    guestCart.items.forEach(async (guestItem) => {
      const existingItemIndex = userCart.items.findIndex(
        (item) => item.productId.toString() === guestItem.productId
      );
      if (existingItemIndex > -1) {
        // Item exists, update quantity
        userCart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // New item, add to cart
        userCart.items.push(guestItem);
      }
    });

    // Recalculate totalPrice
    let totalPrice = 0;
    for (let item of userCart.items) {
      const product = await Product.findById(item.productId);
      totalPrice += product.price * item.quantity;
    }
    userCart.totalPrice = totalPrice;

    await userCart.save();
    res.json(userCart);
  } catch (error) {
    console.error("Error merging cart:", error);
    res
      .status(500)
      .json({ message: "Error merging cart", error: error.message });
  }
});

router.put('/inventory-adjust/:productId', authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const { quantityChange } = req.body; // This can be positive or negative

  try {
      // Fetch the product without triggering full document validation
      const product = await Product.findById(productId).select('productQuantity');
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }

      // Adjust the inventory
      product.productQuantity += quantityChange;

      // Save the changes without validating the entire document
      await product.save({ validateBeforeSave: false });

      res.json({ message: "Inventory updated successfully", product });
  } catch (error) {
      console.error("Error adjusting inventory:", error);
      res.status(500).json({ message: "Failed to adjust inventory", error: error.message });
  }
});



module.exports = router;
