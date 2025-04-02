const mongoose = require("mongoose");

const CommandeSchema = new mongoose.Schema({
  produits: [
    {
      productId: {
        type: Number,
        required: true,
      },
      prix: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Commande", CommandeSchema); 