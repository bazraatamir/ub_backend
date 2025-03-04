const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllEnvironments = async (req, res) => {
  try {
    const environments = await prisma.environment.findMany({
      include: {
        restaurant: true,
      },
    });
    res.json(environments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEnvironmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const environment = await prisma.environment.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: true,
      },
    });

    if (!environment) {
      return res.status(404).json({ error: "Environment not found" });
    }

    res.json(environment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEnvironment = async (req, res) => {
  try {
    const { imageUrl, description, restaurantId } = req.body;
    const environment = await prisma.environment.create({
      data: {
        imageUrl,
        description,
        restaurantId: parseInt(restaurantId),
      },
    });
    res.status(201).json(environment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEnvironment = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, description } = req.body;

    const environment = await prisma.environment.update({
      where: { id: parseInt(id) },
      data: {
        imageUrl,
        description,
      },
    });

    res.json(environment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEnvironment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.environment.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Environment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
