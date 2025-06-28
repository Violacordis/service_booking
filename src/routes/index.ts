import { Router } from "express";
import branchRoutes from "../branch/branch.route";
import serviceRoutes from "../core service/service.route";
import specialistRoutes from "../specialist/specialist.route";
import { authenticate } from "../common/middleware/authenticate.middleware";
import authRoutes from "../auth/auth.route";
import appointmentRoutes from "../appointment/appointment.route";
import paymentRoutes from "../payment/payment.route";
import productRoutes from "../product/product.route";
const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/services", serviceRoutes);
router.use("/specialists", specialistRoutes);
router.use("/appointments", authenticate, appointmentRoutes);
router.use("/make-payment", authenticate, paymentRoutes);

// shop products
router.use("/products", productRoutes);

router.get("/home", (_req, res) => {
  res.json({ status: "OK", message: "Welcome to my service booking API" });
});

export default router;
