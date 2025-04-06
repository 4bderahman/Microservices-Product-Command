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
      quantite: {
        type: Number,
        required: true,
        default: 1
      }
    },
  ],
  prix_total: {
    type: Number,
    required: true,
  },
  client_id: {
    type: String,
    required: true,
  },
  statut: {
    type: String,
    required: true,
    enum: ["En attente", "Confirmée", "Expédiée"],
    default: "En attente"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Commande", CommandeSchema); 