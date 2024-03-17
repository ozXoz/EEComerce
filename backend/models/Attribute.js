// models/Attribute.js
const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  values: [{ type: String }],
});

module.exports = mongoose.model("Attribute", attributeSchema);
