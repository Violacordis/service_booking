import { Router } from "express";
import branchRoutes from "../branch/branch.route";
import serviceRoutes from "../core service/service.route";
import specialistRoutes from "../specialist/specialist.route";
const router = Router();

router.use("/branches", branchRoutes);
router.use("/services", serviceRoutes);
router.use("/specialists", specialistRoutes);

router.get("/home", (_req, res) => {
  res.json({ status: "OK", message: "Welcome to my service booking API" });
});

export default router;
