const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const asyncErrorHandle = require("../middleware/asyncHandler");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

const uploadImage = (file) => {
  const fileName = `${Date.now()}${path.extname(file.name)}`;
  const uploadPath = path.join(process.cwd(), "uploads", fileName);
  fs.writeFileSync(uploadPath, file.data);
  return `/uploads/${fileName}`;
};

const deleteImage = (imageUrl) => {
  if (!imageUrl) return;
  const imagePath = path.join(process.cwd(), imageUrl);
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
};

const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw { status: 400, message: "Validation errors", errors: errors.array() };
  }
};

const getRestaurantInclude = {
  district: true,
  environment: true,
  signatureDish: true,
  tags: { include: { tag: true } },
  menus: { include: { menuItems: true } }
};

exports.createRestaurant = asyncErrorHandle(async (req, res) => {
  validateRequest(req);

  const { name, location, description, districtId } = req.body;
  const imageUrl = req.files?.imageUrl ? uploadImage(req.files.imageUrl) : null;

  const existingRestaurant = await prisma.restaurant.findUnique({ where: { userId: req.user.id } });
  if (existingRestaurant) throw { status: 400, message: "User already has a restaurant" };

  const restaurant = await prisma.restaurant.create({
    data: { name, location, description, imageUrl, districtId: districtId ? parseInt(districtId) : null, userId: req.user.id },
    include: { district: true, user: { select: { id: true, username: true, email: true } } }
  });

  res.status(201).json(restaurant);
});

exports.getAllRestaurants = asyncErrorHandle(async (req, res) => {
  const restaurants = await prisma.restaurant.findMany({ include: getRestaurantInclude });
  res.json(restaurants);
});

exports.getRestaurantById = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const restaurant = await prisma.restaurant.findUnique({ where: { id: parseInt(id) }, include: getRestaurantInclude });
  if (!restaurant) throw { status: 404, message: "Restaurant not found" };
  res.json(restaurant);
});

exports.updateRestaurant = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const { name, location, description, districtId } = req.body;

  const restaurant = await prisma.restaurant.findUnique({ where: { id: parseInt(id) } });
  if (!restaurant) throw { status: 404, message: "Restaurant not found" };
  if (restaurant.userId !== req.user.id) throw { status: 403, message: "Not authorized" };

  if (req.files?.imageUrl) deleteImage(restaurant.imageUrl);
  const imageUrl = req.files?.imageUrl ? uploadImage(req.files.imageUrl) : restaurant.imageUrl;

  const updatedRestaurant = await prisma.restaurant.update({
    where: { id: parseInt(id) },
    data: { name, location, description, imageUrl, districtId: districtId || null },
    include: { district: true }
  });

  res.json(updatedRestaurant);
});

exports.deleteRestaurant = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const restaurant = await prisma.restaurant.findUnique({ where: { id: parseInt(id) } });
  if (!restaurant) throw { status: 404, message: "Restaurant not found" };
  if (restaurant.userId !== req.user.id) throw { status: 403, message: "Not authorized" };

  await prisma.$transaction(async (prisma) => {
    await prisma.environment.deleteMany({ where: { restaurantId: parseInt(id) } });
    await prisma.signatureDish.deleteMany({ where: { restaurantId: parseInt(id) } });
    await prisma.restaurantTag.deleteMany({ where: { restaurantId: parseInt(id) } });
    await prisma.menuItem.deleteMany({ where: { menu: { restaurantId: parseInt(id) } } });
    await prisma.menu.deleteMany({ where: { restaurantId: parseInt(id) } });
    deleteImage(restaurant.imageUrl);
    await prisma.restaurant.delete({ where: { id: parseInt(id) } });
  });

  res.json({ message: "Restaurant deleted successfully" });
});
