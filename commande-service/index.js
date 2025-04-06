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
    app.listen(PORT, () => {
      console.log(`Commande-service running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));

// Updating function to calculate total price
function prixTotal(produits) {
  let total = 0;
  for (let i = 0; i < produits.length; ++i) {
    console.log(`Produit ${i}: `, produits[i]);
    total += produits[i].prix * produits[i].quantite;
  }
  console.log("Prix total:", total);
  return total;
}

// Function to check if product exists and has enough stock
async function checkProductAvailability(productId, quantite) {
  try {
    const response = await axios.get(`http://localhost:4000/produit/${productId}`);
    const product = response.data.product;
    
    if (!product) {
      throw new Error(`Produit ${productId} non trouvé`);
    }
    
    if (product.stock < quantite) {
      throw new Error(`Stock insuffisant pour le produit ${product.nom} (${quantite} demandés, ${product.stock} disponibles)`);
    }
    
    return product;
  } catch (error) {
    throw error;
  }
}

// Function to update product stock after order
async function updateProductStock(productId, quantite) {
  try {
    // Get current product info
    const response = await axios.get(`http://localhost:4000/produit/${productId}`);
    const product = response.data.product;
    
    // Calculate new stock
    const newStock = product.stock - quantite;
    if (newStock < 0) {
      throw new Error(`Stock insuffisant pour le produit ${productId}`);
    }
    
    // Update stock
    await axios.patch(`http://localhost:4000/produit/${productId}/stock`, 
      { stock: newStock },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    return true;
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error);
    throw error;
  }
}

// Create a new command
app.post("/commande/ajouter", isAuthenticated, async (req, res) => {
  try {
    const { produits } = req.body;
    console.log("Creating command with products:", produits);
    
    if (!produits || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ message: "Products array is required and must not be empty" });
    }
    
    // Verify product stock before creating order
    try {
      for (const produit of produits) {
        if (!produit.productId || !produit.prix || !produit.quantite) {
          return res.status(400).json({ 
            message: "Chaque produit doit avoir un productId, un prix et une quantité" 
          });
        }
        
        // Check if product exists and has enough stock
        await checkProductAvailability(produit.productId, produit.quantite);
      }
    } catch (error) {
      console.error("Error verifying products:", error);
      return res.status(400).json({ message: error.message });
    }
    
    const total = prixTotal(produits);
    console.log("Calculated total price:", total);
    
    const newCommande = new Commande({
      produits,
      prix_total: total,
      client_id: req.user.userId,
      statut: "En attente"
    });
    
    console.log("New command created:", newCommande);
    await newCommande.save();
    
    // Update stock for each product
    try {
      for (const produit of produits) {
        await updateProductStock(produit.productId, produit.quantite);
      }
    } catch (error) {
      console.error("Error updating product stock:", error);
      // If stock update fails, we might want to rollback the order or mark it as problematic
      newCommande.statut = "Erreur";
      await newCommande.save();
      return res.status(500).json({ 
        message: "Commande créée mais problème de mise à jour du stock",
        error: error.message,
        commande: newCommande
      });
    }
    
    return res.json(newCommande);
  } catch (error) {
    console.error("Error creating command:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get a specific command
app.get("/commande/:id", isAuthenticated, async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande not found" });
    }
    
    return res.json(commande);
  } catch (error) {
    console.error("Error fetching command:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Update command status
app.patch("/commande/:id/statut", isAuthenticated, async (req, res) => {
  try {
    const { statut } = req.body;
    
    if (!statut || !["En attente", "Confirmée", "Expédiée"].includes(statut)) {
      return res.status(400).json({ 
        message: "Statut invalide. Valeurs acceptées: 'En attente', 'Confirmée', 'Expédiée'" 
      });
    }
    
    const commande = await Commande.findById(req.params.id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande not found" });
    }
    
    commande.statut = statut;
    await commande.save();
    
    return res.json({
      message: "Statut de la commande mis à jour",
      commande: commande
    });
  } catch (error) {
    console.error("Error updating command status:", error);
    return res.status(500).json({ error: error.message });
  }
}); 