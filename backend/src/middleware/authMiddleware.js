const jwt = require("jsonwebtoken");

// Utility to wrap a promise with a timeout
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]);
};

module.exports = (requiredRole = null) => async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("authMiddleware: Token received:", token);
    if (!token) {
      console.log("authMiddleware: No token provided");
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      console.error("authMiddleware: ACCESS_TOKEN_SECRET is not set");
      return res.status(500).json({ message: "Server configuration error: Missing JWT secret" });
    }

    // Wrap jwt.verify in a timeout to prevent hanging
    const decoded = await withTimeout(
      new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      }),
      5000 // 5-second timeout
    );
    console.log("authMiddleware: Decoded token:", decoded);
    req.user = decoded;

    if (requiredRole && decoded.user_type !== requiredRole) {
      console.log(`authMiddleware: Role mismatch - required: ${requiredRole}, got: ${decoded.user_type}`);
      return res.status(403).json({ message: "Access denied: Insufficient role" });
    }

    console.log("authMiddleware: req.user set to:", req.user);
    next();
  } catch (err) {
    console.error("authMiddleware: Token verification error:", err);
    if (err.name === "TokenExpiredError" || err.message === "jwt expired") {
      return res.status(401).json({ message: "Token has expired" });
    }
    if (err.message.includes("timed out")) {
      return res.status(503).json({ message: "Token verification timed out, please try again" });
    }
    return res.status(401).json({ message: "Token is not valid" });
  }
};