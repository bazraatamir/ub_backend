const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllSignatureDishes = async (req, res) => {
  try {
    const signatureDishes = await prisma.signatureDish.findMany({
      include: {
        restaurant: true,
      },
    });
    res.json(signatureDishes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSignatureDishById = async (req, res) => {
  try {
    const { id } = req.params;
    const signatureDish = await prisma.signatureDish.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: true,
      },
    });

    if (!signatureDish) {
      return res.status(404).json({ error: "Signature dish not found" });
    }

    res.json(signatureDish);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSignatureDish = async (req, res) => {
  try {
    const { name, description, imageUrl, restaurantId } = req.body;
    const signatureDish = await prisma.signatureDish.create({
      data: {
        name,
        description,
        imageUrl,
        restaurantId: parseInt(restaurantId),
      },
    });
    res.status(201).json(signatureDish);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSignatureDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;

    const signatureDish = await prisma.signatureDish.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        imageUrl,
      },
    });

    res.json(signatureDish);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSignatureDish = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.signatureDish.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Signature dish deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
