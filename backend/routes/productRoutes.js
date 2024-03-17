// routes/productRoutes.js
const express = require("express");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const Product = require("../models/Product");
const router = express.Router();

// Use multer middleware for the image field in the form
// routes/productRoutes.js

router.post("/image/add", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { imageUrl, ...rest } = req.body;

    // Check if imageUrl is provided and is a non-empty string
    const images =
      imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== ""
        ? [imageUrl.trim()]
        : [];

    const productData = {
      ...rest,
      images: images, // Store the image URL(s) in the images array
    };

    const product = new Product(productData);
    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a new product
router.post("/add", authenticateToken, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body); // Directly using parsed body assuming it matches the model
    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// List all products
router.get("/all", authenticateToken, isAdmin, async (req, res) => {
  try {
    const products = await Product.find().populate("categoryName", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public route to get products for display
router.get("/public/display", async (req, res) => {
  try {
    // Select all fields including the _id field
    const products = await Product.find().select("-__v");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// For Product Details ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product); // Send the complete product details
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Update a product
// Update a product
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a product
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// routes/productRoutes.js

// Endpoint to update product quantity (inventory)
router.put(
  "/inventory/:productId",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const { productId } = req.params;
    const { productQuantity } = req.body; // New inventory quantity

    try {
      const product = await Product.findByIdAndUpdate(
        productId,
        { $set: { productQuantity } },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Inventory updated successfully", product });
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ message: "Failed to update inventory", error });
    }
  }
);

// This route adjusts the product inventory based on the cart item quantity change
// In productRoutes.js or a similar file
router.put(
  "/inventory-adjust/:productId",
  authenticateToken,
  async (req, res) => {
    const { productId } = req.params;
    const { quantityChange } = req.body; // This is the change in quantity (can be positive or negative)

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Adjust inventory
      product.productQuantity += quantityChange;

      // Ensure inventory doesn't go negative
      if (product.productQuantity < 0) {
        product.productQuantity = 0;
      }

      await product.save();
      res.json({ message: "Inventory adjusted successfully", product });
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      res
        .status(500)
        .json({ message: "Failed to adjust inventory", error: error.message });
    }
  }
);

module.exports = router;
