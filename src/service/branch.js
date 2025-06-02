const prisma = require("../../db/prisma.js");

exports.createBranch = async (req, res, next) => {
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
