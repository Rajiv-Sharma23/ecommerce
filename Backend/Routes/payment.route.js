import express from "express";
import { protectRoute } from "../Middlewares/protectRoute.js";
import { checkoutSuccess, createCheckoutSession } from "../Controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;