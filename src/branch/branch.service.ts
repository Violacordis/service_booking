import prismaService from "../../db/prisma";
import { AppError } from "../common/errors/app.error";
import logger from "../common/utilities/logger/index";

export class BranchService {
  async createBranches(
    branches: Array<{
      name: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    }>
  ) {
    if (!branches || !Array.isArray(branches) || branches.length === 0) {
      throw new AppError(
        "Invalid request: 'branches' must be a non-empty array",
        400
      );
    }

    try {
      const createdBranches = await Promise.all(
        branches.map(async (branch) => {
          const { name, address, city, state, country } = branch;

          const createdBranch = await prismaService.branch.create({
            data: {
              name,
              address: address ?? null,
              city: city ?? null,
              state: state ?? null,
              country: country ?? null,
            },
          });

          return createdBranch;
        })
      );

      return {
        message: "Branches created successfully",
        data: createdBranches,
      };
    } catch (error) {
      logger.error("Error creating branches:", error);
      throw new AppError("Failed to create branches!", 500);
    }
  }

  /**
   * Fetches branches with pagination, filtering, and sorting.
   * @param {Object} req - The request object containing query parameters.
   * @param {Object} res - The response object to send the result.
   */

  async getBranches(req: {
    query: {
      page?: 1 | undefined;
      limit?: 10 | undefined;
      term?: any;
      sortBy?: "createdAt" | undefined;
    };
  }) {
    const { page = 1, limit = 10, term, sortBy = "createdAt" } = req.query;

    const filters: {
      OR?: { name: { contains: string; mode: "insensitive" } }[];
    } = {};

    if (term) {
      const searchTerm = term.trim();
      if (searchTerm) {
        filters.OR = [{ name: { contains: searchTerm, mode: "insensitive" } }];
      }
    }

    try {
      const [total, branches] = await Promise.all([
        await prismaService.branch.count({ where: filters }),

        await prismaService.branch.findMany({
          where: filters,
          orderBy: {
            [sortBy]: "desc",
          },
          skip: (page - 1) * limit,
          take: Number(limit),
        }),
      ]);

      return {
        message: "Branches fetched successfully",
        data: branches,
        meta: {
          total,
          page: Number(page),
          pageSize: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error fetching branches:", error);
      throw new AppError("Failed to fetch branches!", 500);
    }
  }
}
