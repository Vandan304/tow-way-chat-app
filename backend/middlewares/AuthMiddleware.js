import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access Denied. No token provided." });

    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    if (!verified) return res.status(401).json({ error: "Invalid Token" });

    const user = await User.findById(verified.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    req.userId = user._id; // Attach user ID to request
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
