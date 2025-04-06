const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true,
    unique: true,
  },
  nom: {
    type: String,
    required: true,
  },
  prix: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
