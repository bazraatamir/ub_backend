const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");
exports.getAllRestaurantTags = asyncErrorHandle(async (req, res) => {
    const restaurantTags = await prisma.restaurantTag.findMany({
      include: {restaurant: true,tag: true,},
    });
    res.json(restaurantTags);
});

exports.getTagsByRestaurant = asyncErrorHandle(async (req, res) => {
    const { restaurantId } = req.params;
    const restaurantTags = await prisma.restaurantTag.findMany({
      where: {restaurantId: parseInt(restaurantId),},
      include: {tag: true,},
    });
    res.json(restaurantTags);
});

exports.getRestaurantsByTag = asyncErrorHandle(async (req, res) => {
    const { tagId } = req.params;
    const restaurantTags = await prisma.restaurantTag.findMany({
      where: {tagId: parseInt(tagId),},
      include: {restaurant: true,},
    });
    res.json(restaurantTags);
});

exports.addTagToRestaurant = asyncErrorHandle(async (req, res) => {
    const { restaurantId, tagId } = req.body;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(restaurantId) },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(tagId) },
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    const existingRelation = await prisma.restaurantTag.findUnique({
      where: {restaurantId_tagId: {restaurantId: parseInt(restaurantId),tagId: parseInt(tagId),}},
    });

    if (existingRelation) {
      return res
        .status(400)
        .json({ message: "Tag already added to restaurant" });
    }

    const restaurantTag = await prisma.restaurantTag.create({
      data: {restaurantId: parseInt(restaurantId),tagId: parseInt(tagId),},
      include: {restaurant: true,tag: true,},
    });
    res.status(201).json(restaurantTag);
});

exports.removeTagFromRestaurant = asyncErrorHandle(async (req, res) => {
    const { restaurantId, tagId } = req.params;
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
      where: {restaurantId_tagId: {restaurantId: parseInt(restaurantId),tagId: parseInt(tagId),},},
    });

    res.json({ message: "Tag removed from restaurant successfully" });
});
