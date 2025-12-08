import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "JWT_SECRET not configured" });
    }

    const decoded = verifyToken(token);
    // Ensure userId is a string for Mongoose lookup
    const userId = decoded.userId?.toString ? decoded.userId.toString() : decoded.userId;
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    // In test environment, provide more details
    const errorMessage = process.env.NODE_ENV === 'test' 
      ? `Invalid or expired token: ${error.message}` 
      : "Invalid or expired token";
    res.status(401).json({ success: false, message: errorMessage });
  }
};

// Role-based access control middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
    }

    next();
  };
};

