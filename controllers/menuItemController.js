const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");

exports.getAllMenuItems = asyncErrorHandle(async (req, res) => {
  // Fetch all menu items, including the menu and the restaurant it belongs to
  const menuItems = await prisma.menuItem.findMany({
    include: {
      menu: {
        include: {
          restaurant: true, // Include restaurant data
        },
      },
    },
  });

  // Filter the menu items to include only those from APPROVED restaurants
  const approvedMenuItems = menuItems.filter(
    (item) => item.menu?.restaurant?.status === "APPROVED"
  );

  res.json(approvedMenuItems); // Return only approved items
});

exports.getMenuItemById = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const menuItem = await prisma.menuItem.findUnique({ where: { id: parseInt(id) }, include: { menu: true } });
  if (!menuItem) return res.status(404).json({ error: "Menu item not found" });
  res.json(menuItem);
});

exports.createMenuItem = asyncErrorHandle(async (req, res) => {
  const { name, description, price, menuId } = req.body;

  if (!name || !price || !menuId) {
    return res.status(400).json({ error: "Name, price, and menuId are required." });
  }

  try {
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        menuId: parseInt(menuId)
      }
    });
    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({ error: "Invalid data provided.", details: error.message });
    } else if (isNaN(parseFloat(price)) || isNaN(parseInt(menuId))) {
        return res.status(400).json({ error: "Invalid price or menuId format." });
    }
    res.status(500).json({ error: "Failed to create menu item." });
  }
});

exports.updateMenuItem = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  let parsedPrice = price !== undefined ? parseFloat(price) : undefined;
  if (price !== undefined && isNaN(parsedPrice)) {
    return res.status(400).json({ error: "Invalid price format." });
  }

  try {
    const menuItem = await prisma.menuItem.findUnique({ where: { id: parseInt(id) } });
    if (!menuItem) return res.status(404).json({ error: "Menu item not found" });

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(parsedPrice !== undefined && { price: parsedPrice }),
      }
    });
    res.json(updatedMenuItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ error: "Menu item not found." });
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({ error: "Invalid data provided.", details: error.message });
    }
    res.status(500).json({ error: "Failed to update menu item." });
  }
});

exports.deleteMenuItem = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  try {
    const menuItem = await prisma.menuItem.findUnique({ where: { id: parseInt(id) } });
    if (!menuItem) return res.status(404).json({ error: "Menu item not found" });

    await prisma.menuItem.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
     console.error("Error deleting menu item:", error);
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ error: "Menu item not found." });
    }
    res.status(500).json({ error: "Failed to delete menu item." });
  }
});
