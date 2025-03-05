const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");

exports.createMenu = asyncErrorHandle(async (req, res) => {

    const { name, description, restaurantId } = req.body;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(restaurantId) },
    });
    if (!restaurant) {return res.status(404).json({ message: "Restaurant not found" });}
    if (restaurant.userId !== req.user.id) {return res.status(403).json({ message: "Not authorized" });}
    const menu = await prisma.menu.create({
      data: {name,description,restaurantId: parseInt(restaurantId),},
      include: {restaurant: true,},
    });
    res.status(201).json(menu);
});

// Get all menus for a restaurant
exports.getMenusByRestaurant = asyncErrorHandle(async (req, res) => {
    const { restaurantId } = req.params;
    const menus = await prisma.menu.findMany({
      where: {restaurantId: parseInt(restaurantId),},
      include: {menuItems: true},
    });
    res.json(menus);
});

exports.getMenuById = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {menuItems: true,restaurant: true,},
    });
    if (!menu) {return res.status(404).json({ message: "Menu not found" });}
    res.json(menu);
});

exports.updateMenu = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {restaurant: true,},
    });
    if (!menu) {return res.status(404).json({ message: "Menu not found" });}
    if (menu.restaurant.userId !== req.user.id) {return res.status(403).json({ message: "Not authorized" });}
    const updatedMenu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {name,description,},
      include: {menuItems: true,},});
    res.json(updatedMenu);
});

exports.deleteMenu = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {restaurant: true,},});
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (menu.restaurant.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.menu.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Menu deleted successfully" });
});
