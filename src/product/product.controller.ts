import { Request, Response } from "express";
import { ProductService } from "./product.service.js";
import { AppError } from "../common/errors/app.error.js";

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
    const productId = req.params.id;
    if (!productId) {
      throw new AppError("Product item ID is required", 400);
    }

    const data = await this.productService.getProductById(productId);

    res.json(data);
  };

  updateProductImage = async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No image file provided", 400);
    }

    const productId = req.params.id;
    if (!productId) {
      throw new AppError("Product ID is required", 400);
    }

    const data = await this.productService.updateProductImage(
      productId,
      req.file.buffer
    );
    res.json(data);
  };
}
