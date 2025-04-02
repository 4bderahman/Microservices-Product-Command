const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4001;
const mongoose = require("mongoose");
const Commande = require("./Commande");
const axios = require("axios");
const isAuthenticated = require("./isAuthenticated");

app.use(express.json());

mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://127.0.0.1/commande-service")
  .then(() => {
    console.log("Commande-service DB Connected");
  })
  .catch((error) => console.log(error));

function prixTotal(produits) {
  let total = 0;
  for (let i = 0; i < produits.length; ++i) {
    console.log(`Produit ${i}: `, produits[i]);
    total += produits[i].prix;
  }
  console.log("Prix total:", total);
  return total;
}

// Nsaybo Command
app.post("/commande/create", isAuthenticated, async (req, res) => {
  try {
    const { produits } = req.body;
    console.log("Creating command with products:", produits);
    
    if (!produits || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ message: "Products array is required and must not be empty" });
    }
    
    const total = prixTotal(produits);
    console.log("Calculated total price:", total);
    
    const newCommande = new Commande({
      produits,
      total,
      userId: req.user.userId
    });
    console.log("New command created:", newCommande);

    await newCommande.save();
    return res.json(newCommande);
  } catch (error) {
    console.error("Error creating command:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get all commands by user
app.get("/commande/get", isAuthenticated, async (req, res) => {
  try {
    const commandes = await Commande.find({ userId: req.user.userId });
    return res.json(commandes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Commande-service running on port ${PORT}`);
}); 