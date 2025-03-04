const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all restaurant tags
exports.getAllRestaurantTags = async (req, res) => {
  try {
    const restaurantTags = await prisma.restaurantTag.findMany({
      include: {
        restaurant: true,
        tag: true,
      },
    });
    res.json(restaurantTags);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get tags by restaurant ID
exports.getTagsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurantTags = await prisma.restaurantTag.findMany({
      where: {
        restaurantId: parseInt(restaurantId),
      },
      include: {
        tag: true,
      },
    });
    res.json(restaurantTags);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get restaurants by tag ID
exports.getRestaurantsByTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const restaurantTags = await prisma.restaurantTag.findMany({
      where: {
        tagId: parseInt(tagId),
      },
      include: {
        restaurant: true,
      },
    });
    res.json(restaurantTags);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add tag to restaurant
exports.addTagToRestaurant = async (req, res) => {
  try {
    const { restaurantId, tagId } = req.body;

    // Check if restaurant exists and user owns it
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(restaurantId) },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(tagId) },
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Check if relation already exists
    const existingRelation = await prisma.restaurantTag.findUnique({
      where: {
        restaurantId_tagId: {
          restaurantId: parseInt(restaurantId),
          tagId: parseInt(tagId),
        },
      },
    });

    if (existingRelation) {
      return res
        .status(400)
        .json({ message: "Tag already added to restaurant" });
    }

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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove tag from restaurant
exports.removeTagFromRestaurant = async (req, res) => {
  try {
    const { restaurantId, tagId } = req.params;

    // Check if restaurant exists and user owns it
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(restaurantId) },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
