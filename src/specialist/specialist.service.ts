import prismaService from "../../db/prisma.js";
import { AppError } from "../common/errors/app.error.js";
import logger from "../common/utilities/logger/index.js";
import { CloudinaryService } from "../common/cloudinary/index.js";
import { AppointmentStatus } from "../../generated/prisma/index.js";

export class SpecialistService {
  async addSpecialists(
    specialists: Array<{
      name: string;
      email: string;
      branchId: string;
      categoryIds: string[];
      phone?: string;
      age?: number;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      aboutMe?: string;
      description?: string;
    }>
  ) {
    if (
      !specialists ||
      !Array.isArray(specialists) ||
      specialists.length === 0
    ) {
      throw new AppError(
        "Invalid request: 'specialists' must be a non-empty array",
        400
      );
    }

    try {
      const results = await Promise.all(
        specialists.map(async (data) => {
          const { categoryIds, branchId, ...specialistData } = data;

          // Validate categories
          const categories = await prismaService.serviceCategory.findMany({
            where: { id: { in: categoryIds } },
            select: {
              id: true,
              service: { select: { branchId: true } },
            },
          });

          if (categories.length !== categoryIds.length) {
            throw new AppError("Invalid category IDs provided", 400);
          }

          const invalidCategory = categories.find(
            (cat) => cat.service.branchId !== branchId
          );

          if (invalidCategory) {
            throw new AppError(
              "All categories must belong to the specified branch",
              400
            );
          }

          // Validate email uniqueness
          const existing = await prismaService.specialist.findUnique({
            where: { email: data.email },
          });

          if (existing) {
            throw new AppError(`Email ${data.email} already exists`, 409);
          }

          // Create specialist
          const created = await prismaService.specialist.create({
            data: {
              ...specialistData,
              branch: { connect: { id: branchId } },
              specialties: {
                create: categoryIds.map((id) => ({
                  category: { connect: { id } },
                })),
              },
            },
            include: { specialties: true },
          });

          return created;
        })
      );

      return {
        message: "Specialists created successfully",
        data: results,
      };
    } catch (error: any) {
      logger.error("Error creating specialists:", error);
      throw new AppError(
        error.message || "Failed to create specialists",
        error.statusCode || 500
      );
    }
  }

  async getSpecialists(req: {
    query: {
      page?: number;
      limit?: number;
      term?: string;
      branchId?: string;
      status?: boolean;
      serviceCategoryId?: string;
      serviceId?: string;
      minRating?: number;
      sortBy?: string;
      sortOrder?: string;
    };
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        term,
        branchId,
        status,
        serviceCategoryId,
        serviceId,
        minRating,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const filters: any = {};

      // Search term filter
      if (term) {
        const searchTerm = term.trim();
        filters.OR = [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm, mode: "insensitive" } },
          {
            specialties: {
              some: {
                category: {
                  name: { contains: searchTerm, mode: "insensitive" },
                },
              },
            },
          },
        ];
      }

      // Status filter
      if (status !== undefined) {
        filters.status = status;
      }

      // Branch filter
      if (branchId) {
        filters.branchId = branchId;
      }

      // Service category filter
      if (serviceCategoryId) {
        filters.specialties = {
          some: { categoryId: serviceCategoryId },
        };
      }

      // Service filter
      if (serviceId) {
        filters.specialties = {
          some: {
            category: { serviceId },
          },
        };
      }

      // Minimum rating filter
      if (minRating !== undefined) {
        filters.rating = {
          gte: minRating,
        };
      }

      const [total, specialists] = await Promise.all([
        prismaService.specialist.count({ where: filters }),
        prismaService.specialist.findMany({
          where: filters,
          skip: (page - 1) * Number(limit),
          take: Number(limit),
          orderBy: { [sortBy]: "desc" },
          include: {
            specialties: {
              select: {
                id: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    price: true,
                    estimatedTime: true,
                    service: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        branchId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

      // Get total completed appointments for each specialist
      const specialistsWithStats = await Promise.all(
        specialists.map(async (specialist) => {
          const totalCompletedAppointments =
            await prismaService.appointment.count({
              where: {
                specialistId: specialist.id,
                status: AppointmentStatus.COMPLETED,
              },
            });

          return {
            ...specialist,
            totalCompletedAppointments,
          };
        })
      );

      return {
        message: "Specialists fetched successfully",
        data: specialistsWithStats,
        meta: {
          total,
          page,
          pageSize: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error: any) {
      logger.error("Error fetching specialists:", error);
      throw new AppError("Failed to fetch specialists", 500);
    }
  }

  async getSpecialistById(specialistId: string) {
    try {
      const specialist = await prismaService.specialist.findUnique({
        where: { id: specialistId },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
              country: true,
            },
          },
          specialties: {
            select: {
              id: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  price: true,
                  estimatedTime: true,
                  service: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      branchId: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!specialist) {
        throw new AppError("Specialist not found", 404);
      }

      // Get total number of completed appointments for this specialist
      const totalCompletedAppointments = await prismaService.appointment.count({
        where: {
          specialistId: specialistId,
          status: AppointmentStatus.COMPLETED,
        },
      });

      const specialistWithStats = {
        ...specialist,
        totalCompletedAppointments,
      };

      return {
        message: "Specialist fetched successfully",
        data: specialistWithStats,
      };
    } catch (error: any) {
      logger.error("Error fetching specialist by ID:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to fetch specialist", 500);
    }
  }

  async updateSpecialistImage(specialistId: string, imageBuffer: Buffer) {
    try {
      // Get the current specialist to check if they have an existing image
      const specialist = await prismaService.specialist.findUnique({
        where: { id: specialistId },
        select: { imageUrl: true },
      });

      if (!specialist) {
        throw new AppError("Specialist not found", 404);
      }

      // Extract public ID from existing image URL if it exists
      let oldPublicId: string | undefined;
      if (specialist.imageUrl) {
        // Extract public ID from Cloudinary URL
        const urlParts = specialist.imageUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        oldPublicId = filename.split(".")[0]; // Remove file extension
      }

      // Upload new image to Cloudinary
      const uploadResult = await CloudinaryService.uploadImage(
        imageBuffer,
        "specialists",
        {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "face",
          quality: "auto",
        }
      );

      // Update specialist with new image URL
      const updatedSpecialist = await prismaService.specialist.update({
        where: { id: specialistId },
        data: { imageUrl: uploadResult.secure_url },
        include: {
          specialties: {
            select: {
              id: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  price: true,
                  estimatedTime: true,
                  service: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      branchId: true,
                    },
                  },
                },
              },
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
        message: "Specialist image updated successfully",
        data: updatedSpecialist,
      };
    } catch (error: any) {
      logger.error("Error updating specialist image:", error);
      throw new AppError(
        error.message || "Failed to update specialist image",
        error.statusCode || 500
      );
    }
  }

  async rateSpecialist(
    specialistId: string,
    clientId: string,
    appointmentId: string,
    rating: number,
    comment?: string
  ) {
    try {
      // Check if specialist exists
      const specialist = await prismaService.specialist.findUnique({
        where: { id: specialistId },
      });

      if (!specialist) {
        throw new AppError("Specialist not found", 404);
      }

      // Check if client exists
      const client = await prismaService.user.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        throw new AppError("Client not found", 404);
      }

      // Validate appointment and check completion status
      const appointment = await prismaService.appointment.findFirst({
        where: {
          id: appointmentId,
          userId: clientId,
          specialistId: specialistId,
        },
      });

      if (!appointment) {
        throw new AppError("Invalid appointment ID", 400);
      }

      // Check if appointment is completed
      if (appointment.status !== AppointmentStatus.COMPLETED) {
        throw new AppError(
          "You can only rate a specialist after the appointment is completed",
          400
        );
      }

      // Check if rating already exists for this appointment
      const existingRating = await prismaService.specialistRating.findUnique({
        where: {
          specialistId_clientId_appointmentId: {
            specialistId,
            clientId,
            appointmentId,
          },
        },
      });

      if (existingRating) {
        throw new AppError(
          "You have already rated this specialist for this appointment",
          409
        );
      }

      // Create the rating
      await prismaService.specialistRating.create({
        data: {
          specialistId,
          clientId,
          appointmentId,
          rating,
          comment,
        },
      });

      // Update specialist's average rating and total ratings
      const ratings = await prismaService.specialistRating.findMany({
        where: { specialistId },
        select: { rating: true },
      });

      const totalRatings = ratings.length;
      const averageRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

      // Update specialist (only rating metrics, not client count)
      await prismaService.specialist.update({
        where: { id: specialistId },
        data: {
          rating: averageRating,
          totalRatings,
        },
      });

      return {
        message: "Specialist rated successfully",
        data: {
          rating,
          comment,
          averageRating,
          totalRatings,
        },
      };
    } catch (error: any) {
      logger.error("Error rating specialist:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to rate specialist", 500);
    }
  }
}
