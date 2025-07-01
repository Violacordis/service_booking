import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { AppError } from "../common/errors/app.error";

export class CoreServiceController {
  private readonly productService = new ProductService();

  createProducts = async (req: Request, res: Response) => {
    const data = await this.productService.createProducts(
      req.body.categories as Array<{
        name: string;
        description?: string;
        items: Array<{
          name: string;
          description?: string;
          price?: number;
          currency: string;
          imageUrl?: string;
        }>;
      }>
    );
    res.json(data);
  };

  getProducts = async (req: Request, res: Response) => {
    const data = await this.productService.getProductItems({
      query: (req as any).validated.query,
    });
    res.json(data);
  };

  getProductcategories = async (req: Request, res: Response) => {
    const data = await this.productService.getProductCategories({
      query: (req as any).validated.query,
    });
    res.json(data);
  };

  getProductsById = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const productId = req.params.id;
    if (!productId) {
      throw new AppError("Product item ID is required", 400);
    }

    const data = await this.productService.getProductById(productId);

    res.json(data);
  };
}
