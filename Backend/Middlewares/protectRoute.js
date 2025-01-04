import jwt, { decode } from "jsonwebtoken";
import User from "../Models/User.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "unauthorized - not token provided" });
    }
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({ message: "Unauthorized, Access token expired" });
      }
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
     return res.status(401).json({ message: "Unauthorized, Invalid access token" });
  }
};

export const adminRoute = async(req,res,next) => {
    if(req.user && req.user.role ==="admin") {
        next();
    }else {
        return res.status(403).json({message:"Access denied - Admin only"})
    }
}
