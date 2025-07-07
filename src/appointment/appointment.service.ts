import prisma from "../../db/prisma.js";
import {
  AppointmentStatus,
  AppointmentType,
  Currency,
  PaymentStatus,
} from "../../generated/prisma/index.js";
import { AppError } from "../common/errors/app.error.js";
import logger from "../common/utilities/logger/index.js";

export class AppointmentService {
  async bookAppointment({
    userId,
    serviceSelections,
    specialistId,
    appointmentDateTime,
    branchId,
    totalCost,
    notes,
    currency,
    numberOfClients,
    type,
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
    type?: AppointmentType;
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

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        specialistId,
        branchId,
        appointmentDate: new Date(appointmentDateTime),
        totalCost,
        notes: notes ?? null,
        currency: currency as Currency,
        numberOfClients,
        type,
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

    return {
      message: "Appointment created successfully",
      data: appointment,
    };
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
        filters.payment = {
          is: {
            status: paymentStatus.toUpperCase() as PaymentStatus,
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

      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.CANCELLED,
          cancelReason: reason ?? null,
        },
      });

      return {
        message: "Appointment cancelled successfully",
        data: updatedAppointment,
      };
    } catch (error) {
      logger.error("Error cancelling appointment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new AppError(`Failed to cancel appointment: ${errorMessage}`, 500);
    }
  }

  async completeAppointment(appointmentId: string, userId: string) {
    try {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          userId,
          status: { not: AppointmentStatus.CANCELLED },
        },
        include: {
          payment: {
            select: {
              status: true,
            },
          },
        },
      });

      if (!appointment) {
        throw new AppError("Appointment not found or already cancelled", 404);
      }

      if (appointment.status === AppointmentStatus.COMPLETED) {
        throw new AppError("Appointment is already completed", 400);
      }

      // Check if appointment is paid
      if (!appointment.payment || appointment.payment.status !== "SUCCESS") {
        throw new AppError("Only paid appointments can be completed", 400);
      }

      // Check if this is the first time this client has completed an appointment with this specialist
      const isFirstTimeClient = await prisma.appointment.findFirst({
        where: {
          userId: appointment.userId,
          specialistId: appointment.specialistId,
          status: AppointmentStatus.COMPLETED,
          id: { not: appointmentId }, // Exclude current appointment
        },
      });

      // Update appointment status
      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.COMPLETED,
        },
      });

      // If this is a new client for this specialist, increment the client count
      if (!isFirstTimeClient) {
        await prisma.specialist.update({
          where: { id: appointment.specialistId },
          data: {
            clientCount: {
              increment: 1,
            },
          },
        });
      }

      return {
        message: "Appointment completed successfully",
        data: updatedAppointment,
        isNewClient: !isFirstTimeClient,
      };
    } catch (error) {
      logger.error("Error completing appointment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new AppError(
        `Failed to complete appointment: ${errorMessage}`,
        500
      );
    }
  }
}
