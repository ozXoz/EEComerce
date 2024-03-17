const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  categoryName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  brand: String,
  images: [{ type: String }],
  description: { type: String, required: true },
  productQuantity: { type: Number, required: true, default: 0 }, // Track inventory
  attributes: [
    {
      key: String,
      value: String,
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
