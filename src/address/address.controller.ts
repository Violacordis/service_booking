import { Request, Response } from "express";
import { AddressService } from "./address.service";
import {
  createAddressSchema,
  updateAddressSchema,
  idParamSchema,
} from "./address.validator";
import { AppError } from "../common/errors/app.error";

export class AddressController {
  private readonly addressService = new AddressService();

  createAddress = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }
    const result = createAddressSchema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }
    let { address, state, country, isDefault } = result.data;
    state = state ?? undefined;
    country = country ?? undefined;
    const newAddress = await this.addressService.createAddress(
      userId,
      address,
      state,
      country,
      isDefault
    );
    res.json(newAddress);
  };

  getAllUserAddresses = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }
    const addresses = await this.addressService.getAddressesByUser(userId);
    res.json(addresses);
  };

  getById = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }
    const result = idParamSchema.safeParse(req.params);
    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }
    const address = await this.addressService.getAddressById(
      userId,
      result.data.id
    );
    if (!address) {
      throw new AppError("Address not found", 404);
    }
    res.json(address);
  };

  updateAddress = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }
    const paramResult = idParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      throw new AppError(paramResult.error.errors[0].message, 400);
    }
    const bodyResult = updateAddressSchema.safeParse(req.body);
    if (!bodyResult.success) {
      throw new AppError(bodyResult.error.errors[0].message, 400);
    }
    let { address, state, country, isDefault } = bodyResult.data;
    state = state ?? undefined;
    country = country ?? undefined;
    const updated = await this.addressService.updateAddress(
      userId,
      paramResult.data.id,
      address,
      state,
      country,
      isDefault
    );
    res.json(updated);
  };

  deleteAddress = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }
    const result = idParamSchema.safeParse(req.params);
    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }
    await this.addressService.deleteAddress(userId, result.data.id);
    res.json({ message: "Address deleted" });
  };
}
