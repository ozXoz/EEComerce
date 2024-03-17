const jwt = require("jsonwebtoken");

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // No token provided

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // Token verification failed
    console.log(decoded); // Check the structure of 'decoded' payload
    // Assuming the payload includes 'id' for the user ID, adjust if using a different key
    // req.user = { id: decoded.id };
    req.user = decoded;  // Set 'req.user' based on the payload structure
    next();
  });
}

// Middleware to check if the authenticated user is an admin
function isAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.sendStatus(403); // User is not an admin
  next();
}

module.exports = { authenticateToken, isAdmin };
