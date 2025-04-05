const mongoose = require("mongoose");

const LivraisonSchema = new mongoose.Schema({
  commande_id: {
    type: String,
    required: true
  },
  transporteur_i: {
    type: String,
    required: true
  },
  adresse_livraison: {
    type: String,
    required: true
  },
  statut: {
    type: String,
    default: "En attente"
  },
  date_creation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Livraison", LivraisonSchema); 