const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const app = express();

const PORT = process.env.PORT_TWO || 4002;

app.use(express.json());

mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://127.0.0.1/auth-service")
  .then(() => {
    console.log("Auth-service DB Connected");
    app.listen(PORT, () => {
      console.log(`Auth-service running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));

// Middleware to verify token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return res.status(401).json({ message: "No auth header provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, "secret-key");
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

// Register
app.post("/auth/register", async (req, res) => {
  try {
    const { nom, email, mot_de_passe } = req.body;
    
    if (!nom || !email || !mot_de_passe) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }
    
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const user = new User({ nom, email, mot_de_passe: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    
    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: "Email et mot de passe sont obligatoires" });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, nom: user.nom },
      "secret-key",
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile
app.get("/auth/profil", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-mot_de_passe");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: error.message });
  }
}); 