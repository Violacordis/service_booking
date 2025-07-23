import prismaService from "../../db/prisma.js";
import { AppError } from "../common/errors/app.error.js";
import logger from "../common/utilities/logger/index.js";

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

  async deleteBranches(branchIds: string[]) {
    if (!Array.isArray(branchIds)) {
      throw new AppError("Invalid request: 'branchIds' must be an array", 400);
    }

    try {
      // Delete in order to handle foreign key constraints
      // 1. Delete appointment service categories for services in these branches
      await prismaService.appointmentServiceCategory.deleteMany({
        where: {
          category: {
            service: {
              branchId: { in: branchIds },
            },
          },
        },
      });

      // 2. Delete appointment services for appointments in these branches
      await prismaService.appointmentService.deleteMany({
        where: {
          appointment: {
            branchId: { in: branchIds },
          },
        },
      });

      // 3. Delete specialist categories for services in these branches
      await prismaService.specialistCategory.deleteMany({
        where: {
          category: {
            service: {
              branchId: { in: branchIds },
            },
          },
        },
      });

      await prismaService.serviceCategory.deleteMany({
        where: {
          service: {
            branchId: { in: branchIds },
          },
        },
      });

      await prismaService.specialistRating.deleteMany({
        where: {
          specialist: {
            branchId: { in: branchIds },
          },
        },
      });

      await prismaService.appointment.deleteMany({
        where: { branchId: { in: branchIds } },
      });

      await prismaService.specialist.deleteMany({
        where: { branchId: { in: branchIds } },
      });

      await prismaService.service.deleteMany({
        where: { branchId: { in: branchIds } },
      });

      const deletedBranches = await prismaService.branch.deleteMany({
        where: { id: { in: branchIds } },
      });

      return {
        message: `${deletedBranches.count} branch(es) deleted successfully`,
        data: { deletedCount: deletedBranches.count },
      };
    } catch (error: any) {
      logger.error("Error deleting branches:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to delete branches!", 500);
    }
  }

  async clearAllBranches() {
    try {
      await prismaService.appointmentServiceCategory.deleteMany({});
      await prismaService.appointmentService.deleteMany({});
      await prismaService.specialistCategory.deleteMany({});
      await prismaService.serviceCategory.deleteMany({});
      await prismaService.specialistRating.deleteMany({});

      await prismaService.appointment.deleteMany({});
      await prismaService.specialist.deleteMany({});

      await prismaService.service.deleteMany({});
      const deletedBranches = await prismaService.branch.deleteMany({});

      return {
        message: `All branches (${deletedBranches.count}) deleted successfully`,
        data: { deletedCount: deletedBranches.count },
      };
    } catch (error: any) {
      logger.error("Error clearing all branches:", error);
      throw new AppError("Failed to clear all branches!", 500);
    }
  }
}
