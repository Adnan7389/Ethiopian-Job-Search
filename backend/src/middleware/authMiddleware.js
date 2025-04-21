const jwt = require("jsonwebtoken");

module.exports = (requiredRole = null) => (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("authMiddleware: Token received:", token);
  if (!token) {
    console.log("authMiddleware: No token provided");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("authMiddleware: Decoded token:", decoded);
    req.user = decoded; // { userId, user_type, iat, exp }

    // Role-based authorization
    if (requiredRole && decoded.user_type !== requiredRole) {
      console.log(`authMiddleware: Role mismatch - required: ${requiredRole}, got: ${decoded.user_type}`);
      return res.status(403).json({ message: "Access denied: Insufficient role" });
    }

    console.log("authMiddleware: req.user set to:", req.user);
    next();
  } catch (err) {
    console.error("authMiddleware: Token verification error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(401).json({ message: "Token is not valid" });
  }
};