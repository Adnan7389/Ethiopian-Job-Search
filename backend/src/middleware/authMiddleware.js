const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Utility to wrap a promise with a timeout (for async operations if needed)
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]);
};

module.exports = (requiredRole = null) => async (req, res, next) => {
  console.log(`[${new Date().toISOString()}] authMiddleware: Processing request for ${req.method} ${req.url}`);

  try {
    const authHeader = req.header("Authorization");
    console.log(`[${new Date().toISOString()}] authMiddleware: Authorization header:`, authHeader);
    
    const token = authHeader?.replace("Bearer ", "");
    console.log(`[${new Date().toISOString()}] authMiddleware: Token received:`, token);
    if (!token) {
      console.log(`[${new Date().toISOString()}] authMiddleware: No token provided`);
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      console.error(`[${new Date().toISOString()}] authMiddleware: ACCESS_TOKEN_SECRET is not set`);
      return res.status(500).json({ message: "Server configuration error: Missing JWT secret" });
    }

    console.log(`[${new Date().toISOString()}] authMiddleware: Starting token verification`);
    
    // Use synchronous jwt.verify to avoid async hangs
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      throw err; // Let the catch block handle errors
    }

    console.log(`[${new Date().toISOString()}] authMiddleware: Decoded token:`, decoded);
    req.user = decoded;

    // Check if user is suspended
    const user = await User.findById(decoded.userId);
    if (user && user.is_suspended) {
      console.log(`[${new Date().toISOString()}] authMiddleware: User is suspended`);
      return res.status(403).json({ message: "Your account has been suspended. Please contact support for assistance." });
    }

    if (requiredRole && decoded.user_type !== requiredRole) {
      console.log(`[${new Date().toISOString()}] authMiddleware: Role mismatch - required: ${requiredRole}, got: ${decoded.user_type}`);
      return res.status(403).json({ message: "Access denied: Insufficient role" });
    }

    console.log(`[${new Date().toISOString()}] authMiddleware: req.user set to:`, req.user);
    next();
  } catch (err) {
    console.error(`[${new Date().toISOString()}] authMiddleware: Token verification error for ${req.method} ${req.url}:`, err.message);
    if (err.name === "TokenExpiredError" || err.message === "jwt expired") {
      return res.status(401).json({ message: "Token has expired" });
    }
    if (err.message.includes("timed out")) {
      return res.status(503).json({ message: "Token verification timed out, please try again" });
    }
    return res.status(401).json({ message: "Token is not valid" });
  }
};