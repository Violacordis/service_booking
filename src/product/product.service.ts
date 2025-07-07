import prismaService from "../../db/prisma.js";
import { Currency } from "../../generated/prisma/index.js";
import { AppError } from "../common/errors/app.error.js";
import { generateShortCode } from "../common/utilities/app.utilities.js";
import logger from "../common/utilities/logger/index.js";
import { CloudinaryService } from "../common/cloudinary/index.js";

export class ProductService {
  createProducts = async (
    categories: Array<{
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
  ) => {
    try {
      if (
        !categories ||
        !Array.isArray(categories) ||
        categories.length === 0
      ) {
        throw new AppError(
          "Invalid request: 'product categories' must be a non-empty array",
          400
        );
      }

      const createdProducts = await Promise.all(
        categories.map(async (product) => {
          const { name, description, items } = product;

          return await prismaService.productCategory.create({
            data: {
              name,
              description: description ?? null,
              code: generateShortCode("PCAT"),
              items: {
                create: items.map((item) => ({
                  name: item.name,
                  code: generateShortCode("PIT"),
                  description: item.description ?? null,
                  price: item.price ?? 0,
                  currency: item.currency as Currency,
                })),
              },
            },
            include: {
              items: true,
            },
          });
        })
      );

      return {
        message: "Products created successfully",
        data: createdProducts,
      };
    } catch (error: any) {
      logger.error("Error creating products:", error);
      throw new AppError("Failed to create products!", 500);
    }
  };

  getProductItems = async (req: {
    query: {
      page?: 1 | undefined;
      limit?: 10 | undefined;
      term: any;
      categoryId?: string | undefined;
      sortBy?: "createdAt" | undefined;
    };
  }) => {
    try {
      const {
        page = 1,
        limit = 10,
        term,
        categoryId,
        sortBy = "createdAt",
      } = req.query;

      const filters: any = {};

      if (term) {
        const searchTerm = term.toString().trim();
        filters.OR = [
          { name: { contains: searchTerm, mode: "insensitive" } },
          {
            category: {
              name: { contains: searchTerm, mode: "insensitive" },
            },
          },
        ];
      }

      if (categoryId) {
        filters.categoryId = categoryId.toString();
      }

      const [total, products] = await Promise.all([
        prismaService.productItem.count({ where: filters }),
        prismaService.productItem.findMany({
          where: filters,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { [sortBy.toString()]: "desc" },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
                code: true,
              },
            },
          },
        }),
      ]);

      return {
        message: "Products fetched successfully",
        data: products,
        meta: {
          total,
          page: Number(page),
          pageSize: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error: any) {
      logger.error("Error fetching products:", error);
      throw new AppError("Failed to fetch products!", 500);
    }
  };

  getProductCategories = async (req: {
    query: {
      page?: 1 | undefined;
      limit?: 10 | undefined;
      term: any;
      sortBy?: "createdAt" | undefined;
    };
  }) => {
    try {
      const { page = 1, limit = 10, term, sortBy = "createdAt" } = req.query;

      const filters: any = {};

      if (term) {
        const searchTerm = term.toString().trim();
        filters.OR = [{ name: { contains: searchTerm, mode: "insensitive" } }];
      }

      const [total, productCategories] = await Promise.all([
        prismaService.productCategory.count({ where: filters }),
        prismaService.productCategory.findMany({
          where: filters,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { [sortBy.toString()]: "desc" },
          include: {
            items: {
              select: {
                id: true,
                name: true,
                description: true,
                code: true,
              },
            },
          },
        }),
      ]);

      return {
        message: "Product categories fetched successfully",
        data: productCategories,
        meta: {
          total,
          page: Number(page),
          pageSize: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error: any) {
      logger.error("Error fetching product categories:", error);
      throw new AppError("Failed to fetch product categories!", 500);
    }
  };

  async getProductById(productId: string) {
    try {
      const product = await prismaService.productItem.findFirst({
        where: {
          id: productId,
        },
        include: {
          category: true,
        },
      });

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      return product;
    } catch (error) {
      logger.error("Error fetching product by ID:", error);
      throw new AppError("Failed to fetch product", 500);
    }
  }

  async updateProductImage(productId: string, imageBuffer: Buffer) {
    try {
      // Get the current product to check if it has an existing image
      const product = await prismaService.productItem.findUnique({
        where: { id: productId },
        select: { imageUrl: true },
      });

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      // Extract public ID from existing image URL if it exists
      let oldPublicId: string | undefined;
      if (product.imageUrl) {
        // Extract public ID from Cloudinary URL
        const urlParts = product.imageUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        oldPublicId = filename.split(".")[0]; // Remove file extension
      }

      // Upload new image to Cloudinary
      const uploadResult = await CloudinaryService.uploadImage(
        imageBuffer,
        "products",
        {
          width: 600,
          height: 600,
          crop: "fill",
          quality: "auto",
        }
      );

      // Update product with new image URL
      const updatedProduct = await prismaService.productItem.update({
        where: { id: productId },
        data: { imageUrl: uploadResult.secure_url },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true,
              code: true,
            },
          },
        },
      });

      // Delete old image from Cloudinary if it exists
      if (oldPublicId) {
        try {
          await CloudinaryService.deleteImage(oldPublicId);
        } catch (error) {
          logger.warn(
            `Failed to delete old image ${oldPublicId}:${error.message}`
          );
        }
      }

      return {
        message: "Product image updated successfully",
        data: updatedProduct,
      };
    } catch (error: any) {
      logger.error("Error updating product image:", error);
      throw new AppError(
        error.message || "Failed to update product image",
        error.statusCode || 500
      );
    }
  }
}
