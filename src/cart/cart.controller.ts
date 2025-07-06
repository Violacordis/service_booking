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

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.cartService.addToCart(
      validated.productId,
      validated.quantity,
      userId
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
    const data = await this.cartService.getUserCartItems({
      query: (req as any).validated.query,
    });
    res.json(data);
  };

  removeCartItem = async (req: Request, res: Response) => {
    const cartItemId = req.params.id;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.cartService.removeFromCart(cartItemId, userId);

    res.json(data);
  };

  updateCartItemQuantity = async (req: Request, res: Response) => {
    const cartItemId = req.params.id;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const validated = updateCartItemBodySchema.parse(req.body);
    const data = await this.cartService.updateCartItemQuantity(
      cartItemId,
      validated.quantity,
      userId
    );

    res.json(data);
  };

  clearUserCart = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.cartService.clearUserCart(userId);

    res.json(data);
  };
}
