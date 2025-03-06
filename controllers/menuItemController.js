const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const asyncErrorHandle = require("../middleware/asyncHandler");

const uploadImage = (file) => {
  const fileName = `${Date.now()}${path.extname(file.name)}`;
  const uploadPath = path.join(process.cwd(), "uploads", fileName);
  fs.writeFileSync(uploadPath, file.data);
  return `/uploads/${fileName}`;
};

const deleteImage = (imageUrl) => {
  if (imageUrl) {
    const imagePath = path.join(process.cwd(), imageUrl);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }
};

exports.getAllMenuItems = asyncErrorHandle(async (req, res) => {
  const menuItems = await prisma.menuItem.findMany({ include: { menu: true } });
  res.json(menuItems);
});

exports.getMenuItemById = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const menuItem = await prisma.menuItem.findUnique({ where: { id: parseInt(id) }, include: { menu: true } });
  if (!menuItem) return res.status(404).json({ error: "Menu item not found" });
  res.json(menuItem);
});

exports.createMenuItem = asyncErrorHandle(async (req, res) => {
  const { name, description, price, menuId } = req.body;
  const imageUrl = req.files?.imageUrl ? uploadImage(req.files.imageUrl) : null;

  const menuItem = await prisma.menuItem.create({
    data: { name, description, price: parseFloat(price), imageUrl, menuId: parseInt(menuId) }
  });
  res.status(201).json(menuItem);
});

exports.updateMenuItem = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const menuItem = await prisma.menuItem.findUnique({ where: { id: parseInt(id) } });
  if (!menuItem) return res.status(404).json({ error: "Menu item not found" });

  if (req.files?.imageUrl) deleteImage(menuItem.imageUrl);
  const imageUrl = req.files?.imageUrl ? uploadImage(req.files.imageUrl) : menuItem.imageUrl;

  const updatedMenuItem = await prisma.menuItem.update({
    where: { id: parseInt(id) },
    data: { name, description, price: price ? parseFloat(price) : undefined, imageUrl }
  });
  res.json(updatedMenuItem);
});

exports.deleteMenuItem = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const menuItem = await prisma.menuItem.findUnique({ where: { id: parseInt(id) } });
  if (!menuItem) return res.status(404).json({ error: "Menu item not found" });

  deleteImage(menuItem.imageUrl);
  await prisma.menuItem.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Menu item deleted successfully" });
});
