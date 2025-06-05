const prisma = require("../../db/prisma.js");

exports.createBranch = async (req, res) => {
  const branches = req.body;
  if (!branches || !Array.isArray(branches) || branches.length === 0) {
    return res.status(400).json({
      message: "Invalid request: 'branches' must be a non-empty array",
    });
  }

  try {
    const createdBranches = await Promise.all(
      branches.map(async (branch) => {
        const { name, description, address, phoneNumber } = branch;

        const createdBranch = await prisma.branch.create({
          data: {
            name,
            address: branch.address ?? null,
            city: branch.city ?? null,
            state: branch.state ?? null,
            country: branch.country ?? null,
          },
        });

        return createdBranch;
      })
    );

    return res.status(201).json({
      message: "Branches created successfully",
      data: createdBranches,
    });
  } catch (error) {
    console.error("Error creating branches:", error.message);

    return res.status(500).json({ message: "Failed to create branches" });
  }
};

exports.getBranches = async (req, res) => {
  const { page = 1, limit = 10, term, sortBy = "createdAt" } = req.query;

  const filters = {};

  if (term) {
    const searchTerm = term.trim();
    if (searchTerm) {
      filters.OR = [{ name: { contains: searchTerm, mode: "insensitive" } }];
    }
  }

  try {
    const [total, branches] = await Promise.all([
      await prisma.branch.count({ where: filters }),

      await prisma.branch.findMany({
        where: filters,
        orderBy: {
          [sortBy]: "desc",
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      message: "Branches fetched successfully",
      data: branches,
      meta: {
        total,
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching branches:", error.message);
    res.status(500).json({ message: "Failed to fetch branches" });
  }
};
