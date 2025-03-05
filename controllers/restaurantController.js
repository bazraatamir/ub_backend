const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Create restaurant
const createRestaurant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, location, description, imageUrl, districtId } = req.body;

    // Check if user already has a restaurant
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { userId: req.user.id },
    });

    if (existingRestaurant) {
      return res.status(400).json({ message: "User already has a restaurant" });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        location,
        description,
        imageUrl,
        districtId: districtId || null,
        userId: req.user.id,
      },
      include: {
        district: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        district: true,
        environment: true,
        signatureDish: true,
        tags: {
          include: {
            tag: true,
          },
        },
        menus: {
          include: {
            menuItems: true,
          },
        },
      },
    });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
      include: {
        district: true,
        environment: true,
        signatureDish: true,
        tags: {
          include: {
            tag: true,
          },
        },
        menus: {
          include: {
            menuItems: true,
          },
        },
      },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, description, imageUrl, districtId } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: {
        name,
        location,
        description,
        imageUrl,
        districtId: districtId || null,
      },
      include: {
        district: true,
      },
    });

    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.restaurant.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
