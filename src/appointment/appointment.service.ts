import { equals } from "class-validator";
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
      status?: string;
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

      const filters: any = {};

      // Search term filter
      if (term) {
        const searchTerm = term.trim();
        filters.OR = [
          {
            specialist: { name: { contains: searchTerm, mode: "insensitive" } },
          },
          { branch: { name: { contains: searchTerm, mode: "insensitive" } } },
          {
            services: {
              some: {
                service: {
                  name: { contains: searchTerm, mode: "insensitive" },
                },
              },
            },
          },
        ];
      }

      // Status filter
      if (status) {
        filters.status = { equals: status as AppointmentStatus };
      }

      // Branch filter
      if (branchId) {
        filters.branchId = branchId;
      }

      if (paymentStatus) {
        if (paymentStatus) {
          filters.payment = {
            is: {
              status: paymentStatus.toUpperCase() as PaymentStatus,
            },
          };
        }
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
      filters.userId = req.userId;

      const [total, appointments] = await Promise.all([
        prisma.appointment.count({ where: filters }),
        prisma.appointment.findMany({
          where: filters,
          skip: (page - 1) * Number(limit),
          take: Number(limit),
          orderBy: { [sortBy]: "desc" },
          include: {
            services: {
              include: {
                service: {
                  select: { name: true, id: true, description: true },
                },
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
            payment: {
              select: {
                id: true,
                amount: true,
                currency: true,
                status: true,
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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      throw new AppError(
        `Failed to fetch user appointments: ${errorMessage}`,
        500
      );
    }
  }

  async getUserAppointmentById(appointmentId: string, userId: string) {
    try {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          userId,
        },
        include: {
          services: {
            include: {
              service: { select: { name: true, id: true, description: true } },
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
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
            },
          },
        },
      });

      if (!appointment) {
        throw new AppError("Appointment not found", 404);
      }

      return appointment;
    } catch (error) {
      logger.error("Error fetching appointment by ID:", error);
      throw new AppError("Failed to fetch appointment", 500);
    }
  }

  async cancelAppointment(
    appointmentId: string,
    userId: string,
    reason?: string
  ) {
    try {
      const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, userId },
      });

      if (!appointment) {
        throw new AppError("Appointment not found", 404);
      }

      if (appointment.status === AppointmentStatus.CANCELLED) {
        throw new AppError("Appointment is already cancelled", 400);
      }

      if (appointment.status === AppointmentStatus.PAID) {
        throw new AppError(
          "Cannot cancel a paid appointment. Please contact support.",
          400
        );
      }

      return prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.CANCELLED,
          cancelReason: reason ?? null,
        },
      });
    } catch (error) {
      logger.error("Error cancelling appointment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new AppError(`Failed to cancel appointment: ${errorMessage}`, 500);
    }
  }
}
