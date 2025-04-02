const jwt = require("jsonwebtoken");

module.exports = async function isAuthenticated(req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader);
    
    if (!authHeader) {
      console.log("No authorization header provided");
      return res.status(401).json({ message: "No auth header provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Token extracted:", token ? "Token present" : "No token");
    
    if (!token) {
      console.log("No token in authorization header");
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