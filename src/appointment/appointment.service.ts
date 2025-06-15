import prisma from "../../db/prisma";
import { AppError } from "../common/errors/app.error";

export class AppointmentService {
  async createPersonalBooking({
    userId,
    serviceSelections,
    specialistId,
    appointmentDateTime,
    branchId,
    totalCost,
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
}
