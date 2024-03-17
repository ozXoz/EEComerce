const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  shippingId: String,
  comments: String,
  status: { type: String, enum: ['sent', 'preparing'], default: 'preparing' },
  shippingCompanyName: String,
  shippingTrackerId: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Tracking', trackingSchema);
