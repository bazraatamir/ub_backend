const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");

exports.getAllTags = asyncErrorHandle(async (req, res) => {
  const tags = await prisma.tag.findMany({
    include: {restaurants: {include: {restaurant: true}}},
  });
  res.json(tags);
});

exports.getTagById = asyncErrorHandle(async (req, res) => {
  const {id} = req.params;
  const tag = await prisma.tag.findUnique({
    where: {id: parseInt(id)},
    include: {restaurants: {include: {restaurant: true}}},
  });

  if (!tag) {
    return res.status(404).json({error: "Tag not found"});
  }
  res.json(tag);
});

exports.createTag = asyncErrorHandle(async (req, res) => {
  const {name, description} = req.body;
  const tag = await prisma.tag.create({
    data: {name, description},
  });
  res.status(201).json(tag);
});

exports.updateTag = asyncErrorHandle(async (req, res) => {
  const {id} = req.params;
  const {name, description} = req.body;

  const tag = await prisma.tag.update({
    where: {id: parseInt(id)},
    data: {name, description},
  });
  res.json(tag);
});

exports.deleteTag = asyncErrorHandle(async (req, res) => {
  const {id} = req.params;
  await prisma.tag.delete({
    where: {id: parseInt(id)},
  });
  res.json({message: "Tag deleted successfully"});
});

exports.addTagToRestaurant = asyncErrorHandle(async (req, res) => {
  const {restaurantId, tagId} = req.body;
  const restaurantTag = await prisma.restaurantTag.create({
    data: {restaurantId: parseInt(restaurantId), tagId: parseInt(tagId)},
    include: {restaurant: true, tag: true},
  });
  res.status(201).json(restaurantTag);
});

exports.removeTagFromRestaurant = asyncErrorHandle(async (req, res) => {
  const {restaurantId, tagId} = req.params;
  await prisma.restaurantTag.delete({
    where: {
      restaurantId_tagId: {
        restaurantId: parseInt(restaurantId),
        tagId: parseInt(tagId),
      },
    },
  });
  res.json({message: "Tag removed from restaurant successfully"});
});
