const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const asyncErrorHandle = require("../middleware/asyncHandler");
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

const createRestaurant = asyncErrorHandle(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, location, description, districtId } = req.body;
  let imageUrl = null;

  if (req.files && req.files.imageUrl) {
    const file = req.files.imageUrl;
    const fileExt = path.extname(file.name);
    const fileName = Date.now() + fileExt;
    const uploadPath = path.join(process.cwd(), 'uploads', fileName);
    
    const imageBuffer = Buffer.from(file.data);
    fs.writeFileSync(uploadPath, imageBuffer);
    
    imageUrl = `/uploads/${fileName}`;
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      location,
      description,
      imageUrl,
      districtId: districtId ? parseInt(districtId) : null,
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
});

const getAllRestaurants = asyncErrorHandle(async (req, res) => {
  const restaurants = await prisma.restaurant.findMany({
    where: {
      userId: req.user?.id
    },
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
});

const getRestaurantById = asyncErrorHandle(async (req, res) => {
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
});

const updateRestaurant = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const { name, location, description, districtId } = req.body;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parseInt(id) },
  });

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  if (restaurant.userId !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  let imageUrl = restaurant.imageUrl;

  if (req.files && req.files.imageUrl) {
    const file = req.files.imageUrl;
    const fileExt = path.extname(file.name);
    const fileName = Date.now() + fileExt;
    const uploadPath = path.join(process.cwd(), 'uploads', fileName);
    
    const imageBuffer = Buffer.from(file.data);
    fs.writeFileSync(uploadPath, imageBuffer);
    
    imageUrl = `/uploads/${fileName}`;

    // Delete old image if exists
    if (restaurant.imageUrl) {
      const oldImagePath = path.join(process.cwd(), restaurant.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
  }

  const updatedRestaurant = await prisma.restaurant.update({
    where: { id: parseInt(id) },
    data: {
      name,
      location,
      description,
      imageUrl,
      districtId: districtId ? parseInt(districtId) : null,
    },
    include: {
      district: true,
    },
  });

  res.json(updatedRestaurant);
});

const deleteRestaurant = asyncErrorHandle(async (req, res) => {
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

  // Delete all related data first
  await prisma.$transaction(async (prisma) => {
    // Delete all environments
    await prisma.environment.deleteMany({
      where: { restaurantId: parseInt(id) },
    });

    // Delete all signature dishes
    await prisma.signatureDish.deleteMany({
      where: { restaurantId: parseInt(id) },
    });

    // Delete all restaurant tags
    await prisma.restaurantTag.deleteMany({
      where: { restaurantId: parseInt(id) },
    });

    // Delete all menu items first
    await prisma.menuItem.deleteMany({
      where: { 
        menu: {
          restaurantId: parseInt(id)
        }
      },
    });

    // Then delete all menus
    await prisma.menu.deleteMany({
      where: { restaurantId: parseInt(id) },
    });

    // Delete image if exists
    if (restaurant.imageUrl) {
      const imagePath = path.join(process.cwd(), restaurant.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Finally delete the restaurant
    await prisma.restaurant.delete({
      where: { id: parseInt(id) },
    });
  });

  res.json({ message: "Restaurant deleted successfully" });
});

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
