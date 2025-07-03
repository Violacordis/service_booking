import { Router } from "express";
import { AddressController } from "./address.controller";
import { validate } from "../common/middleware/validate.middleware";
import {
  createAddressSchema,
  idParamSchema,
  updateAddressSchema,
} from "./address.validator";

const router = Router();
const controller = new AddressController();

router.post(
  "/",
  validate({ body: createAddressSchema }),
  controller.createAddress
);
router.get("/", controller.getAllUserAddresses);
router.get("/:id", validate({ params: idParamSchema }), controller.getById);
router.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateAddressSchema }),
  controller.updateAddress
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  controller.deleteAddress
);

export default router;
