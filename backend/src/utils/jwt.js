import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  // Ensure userId is a string (Mongoose ObjectIds need to be converted)
  const userIdString = userId?.toString ? userId.toString() : userId;
  return jwt.sign({ userId: userIdString }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d"
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

