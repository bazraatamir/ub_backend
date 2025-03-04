const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllDistricts = async (req, res) => {
  try {
    const districts = await prisma.district.findMany({
      include: {
        restaurants: true,
      },
    });
    res.json(districts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;
    const district = await prisma.district.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurants: true,
      },
    });

    if (!district) {
      return res.status(404).json({ error: "District not found" });
    }

    res.json(district);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDistrict = async (req, res) => {
  try {
    const { name, description } = req.body;
    const district = await prisma.district.create({
      data: {
        name,
        description,
      },
    });
    res.status(201).json(district);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const district = await prisma.district.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
      },
    });

    res.json(district);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.district.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "District deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
