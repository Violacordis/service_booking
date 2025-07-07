import { Router } from "express";
import branchRoutes from "../branch/branch.route.js";
import serviceRoutes from "../core service/service.route.js";
import specialistRoutes from "../specialist/specialist.route.js";
import { authenticate } from "../common/middleware/authenticate.middleware.js";
import authRoutes from "../auth/auth.route.js";
import appointmentRoutes from "../appointment/appointment.route.js";
import paymentRoutes from "../payment/payment.route.js";
import productRoutes from "../product/product.route.js";
import cartRoute from "../cart/cart.route.js";
import orderRoutes from "../order/order.route.js";
import addressRoutes from "../address/address.route.js";
import uploadRoutes from "../upload/upload.route.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/services", serviceRoutes);
router.use("/specialists", specialistRoutes);
router.use("/appointments", authenticate, appointmentRoutes);
router.use("/make-payment", authenticate, paymentRoutes);

// shop products
router.use("/products", productRoutes);
router.use("/cart/items", authenticate, cartRoute);
router.use("/orders", authenticate, orderRoutes);
router.use("/addresses", authenticate, addressRoutes);
router.use("/upload", uploadRoutes);

router.get("/home", (_req, res) => {
  res.json({ status: "OK", message: "Welcome to my service booking API" });
});

export default router;
