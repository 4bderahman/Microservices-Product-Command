const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const Product = require("./models/Product");
const app = express();

app.use(express.json());

// Set strict query mode
mongoose.set("strictQuery", true);

// Auth middleware
const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ message: "No auth header provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, "secret-key");
      console.log("Token decoded successfully:", decoded);
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      return res.status(401).json({ message: "Invalid token: " + jwtError.message });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication error" });
  }
};

// Db connection
mongoose
  .connect("mongodb://127.0.0.1/produit-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Produit-service DB Connected");
    // Start the server after DB connection
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed:", error);
  });

// POST ROUTE
app.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const productData = {
        productId: req.body.productId, 
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
      };
        
      if (!productData.productId) {
        return res.status(400).json({
          message: "id est obligatoire!",
        });
      }

      const newProduct = new Product(productData);
      const savedProduct = await newProduct.save();

      res.status(201).json({
        message: "Produit créé avec succès",
        product: savedProduct,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({
        message: "Error creating product",
        error: error.message
      });
    }
  } 
);

// GET ROUTE
app.get("/api/products/:productId", isAuthenticated, async (req, res) => {
    try {
      const productId = Number(req.params.productId);
      const product = await Product.findOne({ productId: productId });

      if (!product) {
        return res.status(404).json({
          message: "Produit non trouvé!",
        });
      }
      res.json({
        message: "Produit trouvé!",
        product: product,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({
        message: "Error fetching product",
        error: error.message
      });
    }
  });

// Define PORT above the server start
const PORT = process.env.PORT || 4000;
