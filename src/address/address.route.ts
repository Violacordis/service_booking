import { Router } from "express";
import { AddressController } from "./address.controller.js";
import { validate } from "../common/middleware/validate.middleware.js";
import {
  createAddressSchema,
  idParamSchema,
  updateAddressSchema,
} from "./address.validator.js";

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
