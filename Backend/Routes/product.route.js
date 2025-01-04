import express from "express";
import { getAllProducts } from "../Controllers/product.controller.js";
import { adminRoute, protectRoute, getFeaturedProducts } from "../Middlewares/protectRoute.js";

const router = express.Router();

router.get("/",protectRoute,adminRoute,getAllProducts);
router.get("/",getFeaturedProducts);

export default router;