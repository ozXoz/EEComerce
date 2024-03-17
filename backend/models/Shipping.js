// Shipping.js

const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming you have a User model
  address: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
});

module.exports = mongoose.model('Shipping', shippingSchema);
