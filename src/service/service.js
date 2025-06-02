const prisma = require("../../db/prisma.js");
const { generateShortCode } = require("../utilities/app.utilities.js");

exports.createServices = async (req, res, next) => {
  const services = req.body;
  if (!services || !Array.isArray(services) || services.length === 0) {
    return res.status(400).json({
      message: "Invalid request: 'services' must be a non-empty array",
    });
  }

  try {
    const createdServices = await Promise.all(
      services.map(async (service) => {
        const { name, description, branchId, categories } = service;

        const createdService = await prisma.service.create({
          data: {
            name,
            description: description ?? null,
            branch: {
              connect: { id: branchId },
            },
            code: generateShortCode("SRV"),
            categories: {
              create: categories.map((cat) => ({
                name: cat.name,
                code: generateShortCode("CAT"),
                description: cat.description,
                price: cat.price ?? 0,
                estimatedTime: cat.estimatedTime ?? null,
              })),
            },
          },
          include: {
            categories: true,
          },
        });

        return createdService;
      })
    );

    return res.status(201).json({
      message: "Services created successfully",
      data: createdServices,
    });
  } catch (error) {
    console.error("Error creating services:", error.message);

    return res.status(500).json({ message: "Failed to create services" });
  }
};
