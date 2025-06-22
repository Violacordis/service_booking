import prisma from "../../db/prisma";
import {
  AppointmentStatus,
  AppointmentType,
  Currency,
  PaymentStatus,
} from "../../generated/prisma";
import { AppError } from "../common/errors/app.error";
import logger from "../common/utilities/logger";

export class AppointmentService {
  async createPersonalBooking({
    userId,
    serviceSelections,
    specialistId,
    appointmentDateTime,
    branchId,
    totalCost,
    notes,
    currency,
    numberOfClients,
  }: {
    userId: string;
    serviceSelections: {
      serviceId: string;
      categoryIds: string[];
    }[];
    specialistId: string;
    appointmentDateTime: string;
    branchId: string;
    totalCost: number;
    notes?: string;
    currency: string;
    numberOfClients: number;
  }) {
    // check if specialist exists in the branch
    const specialist = await prisma.specialist.findUnique({
      where: {
        id: specialistId,
        branchId: branchId,
      },
    });

    if (!specialist) {
      throw new AppError("Specialist not found in the specified branch", 404);
    }

    // check if specialist offers the selected service categories
    const serviceCategories = await prisma.serviceCategory.findMany({
      where: {
        id: { in: serviceSelections.flatMap((s) => s.categoryIds) },
        specialists: {
          some: {
            specialistId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (serviceCategories.length === 0) {
      throw new AppError(
        "Specialist does not offer any of the selected service categories",
        400
      );
    }
    const selectedCategoryIds = serviceSelections.flatMap((s) => s.categoryIds);
    const validCategories = serviceCategories.map((c) => c.id);
    const invalidCategories = selectedCategoryIds.filter(
      (id) => !validCategories.includes(id)
    );

    if (invalidCategories.length > 0) {
      throw new AppError(
        `Specialist does not offer the following service categories: ${invalidCategories.join(
          ", "
        )}`,
        400
      );
    }

    return prisma.appointment.create({
      data: {
        userId,
        specialistId,
        branchId,
        appointmentDate: new Date(appointmentDateTime),
        totalCost,
        notes: notes ?? null,
        currency: currency as Currency,
        numberOfClients,
        services: {
          create: serviceSelections.map(({ serviceId, categoryIds }) => ({
            service: { connect: { id: serviceId } },
            categories: {
              create: categoryIds.map((categoryId) => ({
                category: { connect: { id: categoryId } },
              })),
            },
          })),
        },
      },
      include: {
        services: {
          include: {
            categories: true,
          },
        },
      },
    });
  }

  async getUserAppointments(req: {
    query: {
      page?: number;
      limit?: number;
      term?: string;
      branchId?: string;
      status?: AppointmentStatus;
      type?: AppointmentType;
      startDate?: string;
      endDate?: string;
      paymentStatus?: string;
      sortBy?: string;
    };
    userId: string;
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        term,
        branchId,
        status,
        type,
        startDate,
        endDate,
        paymentStatus,
        sortBy = "createdAt",
      } = req.query;

      const filters: any = { userId: req.userId };

      // Search term filter
      if (term) {
        const searchTerm = term.trim();
        filters.OR = [
          {
            specialist: { name: { contains: searchTerm, mode: "insensitive" } },
          },
          { branch: { name: { contains: searchTerm, mode: "insensitive" } } },
        ];
      }

      // Status filter
      if (status !== undefined) {
        filters.status = status as AppointmentStatus;
      }

      // Branch filter
      if (branchId) {
        filters.branchId = branchId;
      }

      if (paymentStatus) {
        filters.paymentStatus = {
          payment: {
            status: paymentStatus as PaymentStatus,
          },
        };
      }

      if (type) {
        filters.type = type as AppointmentType;
      }

      // Date range filter
      if (startDate || endDate) {
        filters.appointmentDate = {};
        if (startDate) {
          filters.appointmentDate.gte = new Date(startDate);
        }
        if (endDate) {
          filters.appointmentDate.lte = new Date(endDate);
        }
      }

      const [total, appointments] = await Promise.all([
        prisma.appointment.count({ where: filters }),
        prisma.appointment.findMany({
          where: filters,
          skip: (page - 1) * Number(limit),
          take: Number(limit),
          orderBy: { [sortBy]: "desc" },
          include: {
            payment: {
              select: {
                id: true,
                amount: true,
                currency: true,
                status: true,
              },
            },
            specialist: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
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
          },
        }),
      ]);

      return {
        message: "User Appointments fetched successfully",
        data: appointments,
        meta: {
          total,
          page,
          pageSize: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error: any) {
      logger.error("Error fetching appointments:", error);
      throw new AppError("Failed to fetch user appointments", 500);
    }
  }
}
