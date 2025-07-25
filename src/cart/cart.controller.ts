import { Request, Response } from "express";
import { AppError } from "../common/errors/app.error.js";
import {
  AddToCartSchema,
  checkoutOrderSchema,
  updateCartItemBodySchema,
} from "./cart.validator.js";
import { CartService } from "./cart.service.js";

export class CartController {
  private readonly cartService = new CartService();

  addToCart = async (req: Request, res: Response) => {
    const validated = AddToCartSchema.parse(req.body);
    const userId =
      typeof req.body.userId === "string" ? req.body.userId : undefined;
    const guestId =
      typeof req.body.guestId === "string" ? req.body.guestId : undefined;
    if (!userId && !guestId) {
      throw new AppError("Missing user or guest identifier", 400);
    }
    const data = await this.cartService.addToCart(
      validated.productId,
      validated.quantity,
      userId,
      guestId
    );
    res.json(data);
  };

  checkoutCart = async (req: Request, res: Response) => {
    const validated = checkoutOrderSchema.parse(req.body);

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.cartService.checkoutCart(
      validated.cartItemIds,
      validated.totalAmount,
      userId,
      validated.currency,
      validated.note
    );

    res.json(data);
  };

  getUserCartItems = async (req: Request, res: Response) => {
    const userId =
      typeof req.query.userId === "string" ? req.query.userId : undefined;
    const guestId =
      typeof req.query.guestId === "string" ? req.query.guestId : undefined;
    if (!userId && !guestId) {
      throw new AppError("Missing user or guest identifier", 400);
    }
    const data = await this.cartService.getUserCartItems({
      userId,
      guestId,
      query: (req as any).validated.query,
    });
    res.json(data);
  };

  removeCartItem = async (req: Request, res: Response) => {
    const cartItemId = req.params.id;
    const userId =
      typeof req.body.userId === "string" ? req.body.userId : undefined;
    const guestId =
      typeof req.body.guestId === "string" ? req.body.guestId : undefined;
    if (!userId && !guestId) {
      throw new AppError("Missing user or guest identifier", 400);
    }
    const data = await this.cartService.removeFromCart(
      cartItemId,
      userId,
      guestId
    );
    res.json(data);
  };

  updateCartItemQuantity = async (req: Request, res: Response) => {
    const cartItemId = req.params.id;
    const userId =
      typeof req.body.userId === "string" ? req.body.userId : undefined;
    const guestId =
      typeof req.body.guestId === "string" ? req.body.guestId : undefined;
    if (!userId && !guestId) {
      throw new AppError("Missing user or guest identifier", 400);
    }
    const validated = updateCartItemBodySchema.parse(req.body);
    const data = await this.cartService.updateCartItemQuantity(
      cartItemId,
      validated.quantity,
      userId,
      guestId
    );
    res.json(data);
  };

  clearUserCart = async (req: Request, res: Response) => {
    const userId =
      typeof req.body.userId === "string" ? req.body.userId : undefined;
    const guestId =
      typeof req.body.guestId === "string" ? req.body.guestId : undefined;
    if (!userId && !guestId) {
      throw new AppError("Missing user or guest identifier", 400);
    }
    const data = await this.cartService.clearUserCart(userId, guestId);
    res.json(data);
  };

  mergeGuestCart = async (req: Request, res: Response) => {
    const userId = typeof req.user?.id === "string" ? req.user.id : undefined;
    const guestId =
      typeof req.body.guestId === "string"
        ? req.body.guestId
        : typeof req.query.guestId === "string"
        ? req.query.guestId
        : undefined;
    if (!userId || !guestId) {
      throw new AppError("Missing user or guest identifier", 400);
    }
    const result = await this.cartService.mergeGuestCartToUserCart(
      userId,
      guestId
    );
    res.json(result);
  };
}
