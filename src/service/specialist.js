const prisma = require("../../db/prisma.js");

exports.addSpecialist = async (req, res, next) => {
  const { categoryIds, branchId, ...data } = req.body;

  const categories = await prisma.serviceCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, service: { select: { branchId: true } } },
  });

  if (categories.length !== categoryIds.length) {
    return res.status(400).json({
      message: "Invalid category IDs provided",
    });
  }

  const invalidCategories = categories.find(
    (cat) => cat.service.branchId !== branchId
  );

  if (invalidCategories) {
    return res.status(400).json({
      message: "All categories must belong to the same branch",
    });
  }

  const specialistExists = await prisma.specialist.findUnique({
    where: { email: data.email },
  });

  if (specialistExists) {
    res.status(409).json({ message: "Email already exists" });
  }

  try {
    await prisma.specialist.create({
      data: {
        description: data.description ?? null,
        name: data.name,
        email: data.email,
        phone: data.phoneNumber ?? null,
        age: data.age ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        country: data.country ?? null,
        branch: {
          connect: { id: branchId },
        },
        specialties: {
          create: categoryIds.map((id) => ({
            category: {
              connect: { id },
            },
          })),
        },
      },
    });

    res.status(201).json({
      message: "Specialist added successfully",
    });
  } catch (error) {
    console.error("Error adding specialist:", error.message);
    res.status(500).json({
      message: "Failed to add specialist",
      error: error.message,
    });
  }
};
