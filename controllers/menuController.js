const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createMenu = async (req, res) => {
  try {
    const { name, description, restaurantId } = req.body;

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

    const menu = await prisma.menu.create({
      data: {
        name,
        description,
        restaurantId: parseInt(restaurantId),
      },
      include: {
        restaurant: true,
      },
    });

    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all menus for a restaurant
exports.getMenusByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const menus = await prisma.menu.findMany({
      where: {
        restaurantId: parseInt(restaurantId),
      },
      include: {
        menuItems: true,
      },
    });

    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get menu by ID
exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {
        menuItems: true,
        restaurant: true,
      },
    });

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update menu
exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: true,
      },
    });

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (menu.restaurant.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedMenu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
      },
      include: {
        menuItems: true,
      },
    });

    res.json(updatedMenu);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete menu
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: true,
      },
    });

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
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
