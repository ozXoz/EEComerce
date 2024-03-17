// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: String,
  email: String,
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: 'pending' },
  tracking: { type: mongoose.Schema.Types.ObjectId, ref: 'Tracking' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
