const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mot_de_passe: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema); 