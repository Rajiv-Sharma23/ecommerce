import express from "express";
import { getAllProducts, getFeaturedProducts, createProduct, deleteProduct, getRecommededProducts,getProductsByCategory,toggleFeaturedProducts } from "../Controllers/product.controller.js";
import { adminRoute, protectRoute,} from "../Middlewares/protectRoute.js";

const router = express.Router();

router.get("/",protectRoute,adminRoute,getAllProducts);
router.get("/",getFeaturedProducts);
router.get("/category/:category",getProductsByCategory);
router.get("/recommendations",getRecommededProducts);
router.post("/",protectRoute,adminRoute,createProduct);
router.patch("/:id",protectRoute,adminRoute,toggleFeaturedProducts);
router.delete("/:id",protectRoute,adminRoute,deleteProduct);

export default router;