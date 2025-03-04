const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        restaurants: {
          include: {
            restaurant: true,
          },
        },
      },
    });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurants: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    const tag = await prisma.tag.create({
      data: {
        name,
        description,
      },
    });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const tag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
      },
    });

    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tag.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restaurant Tag Relations
exports.addTagToRestaurant = async (req, res) => {
  try {
    const { restaurantId, tagId } = req.body;
    const restaurantTag = await prisma.restaurantTag.create({
      data: {
        restaurantId: parseInt(restaurantId),
        tagId: parseInt(tagId),
      },
      include: {
        restaurant: true,
        tag: true,
      },
    });
    res.status(201).json(restaurantTag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeTagFromRestaurant = async (req, res) => {
  try {
    const { restaurantId, tagId } = req.params;
    await prisma.restaurantTag.delete({
      where: {
        restaurantId_tagId: {
          restaurantId: parseInt(restaurantId),
          tagId: parseInt(tagId),
        },
      },
    });
    res.json({ message: "Tag removed from restaurant successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
