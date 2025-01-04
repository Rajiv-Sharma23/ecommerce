import express from "express";
import { Login, Logout, refreshToken, Signup } from "../Controllers/user.controller.js";


const router = express.Router();

router.post("/signup",Signup);
router.post("/login",Login);
router.post("/logout",Logout);
router.post("/refresh-token",refreshToken);
// router.post("/profile",userProfile);

export default router;