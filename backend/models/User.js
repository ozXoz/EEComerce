const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  phoneNumber: String,
  role: { type: String, default: 'user' } // 'admin' for admin users
});

module.exports = mongoose.model('User', userSchema);
