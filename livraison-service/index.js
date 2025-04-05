const express = require("express");
const app = express();
const PORT = process.env.PORT_THREE || 4003;
const mongoose = require("mongoose");
const Livraison = require("./livraison");
const isAuthenticated = require("./isAuthenticated");
const axios = require('axios');

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1/livraison-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Livraison-service DB Connected");
    app.listen(PORT, () => {
        console.log(`Livraison-Service running on port ${PORT}`);
    });
}).catch((err) => console.log(err));

app.use(express.json());

// Function to verify if a command exists before creating a delivery
async function verifyCommandeExists(id) {
    try {
        const URL = `http://localhost:4001/commande/${id}`;
        const response = await axios.get(URL, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data;
    } catch (error) {
        console.error("Error verifying commande:", error);
        return null;
    }
}

// Create a new delivery
app.post("/livraison/create", isAuthenticated, async (req, res) => {
    try {
        const { commande_id, transporteur_i, adresse_livraison } = req.body;

        if (!commande_id || !transporteur_i || !adresse_livraison) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Verify that the command exists
        const commande = await verifyCommandeExists(commande_id);
        if (!commande) {
            return res.status(404).json({ message: "Commande not found" });
        }

        const newLivraison = new Livraison({
            commande_id,
            transporteur_i,
            adresse_livraison,
            userId: req.user.userId // Link to the user who created the delivery
        });

        const savedLivraison = await newLivraison.save();
        res.status(201).json(savedLivraison);
    } catch (error) {
        console.error("Error creating livraison:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update delivery status to "Confirmed"
app.put("/livraison/:id/confirm", isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const livraison = await Livraison.findOneAndUpdate(
            { _id: id },
            { $set: { statut: "Confirmée" } },
            { new: true }
        );

        if (!livraison) {
            return res.status(404).json({ message: "Livraison not found" });
        }

        res.json(livraison);
    } catch (error) {
        console.error("Error updating livraison:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all deliveries for a user
app.get("/livraison/list", isAuthenticated, async (req, res) => {
    try {
        const livraisons = await Livraison.find({ userId: req.user.userId });
        res.json(livraisons);
    } catch (error) {
        console.error("Error fetching livraisons:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get a specific delivery by ID
app.get("/livraison/:id", isAuthenticated, async (req, res) => {
    try {
        const livraison = await Livraison.findById(req.params.id);
        
        if (!livraison) {
            return res.status(404).json({ message: "Livraison not found" });
        }
        
        res.json(livraison);
    } catch (error) {
        console.error("Error fetching livraison:", error);
        res.status(500).json({ error: error.message });
    }
}); 