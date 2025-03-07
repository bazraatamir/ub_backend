const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const asyncErrorHandle = require("../middleware/asyncHandler");
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');
const sharp = require("sharp");

const uploadMedia = async (file) => {
  const fileName = `${Date.now()}${path.extname(file.name)}`;
  const uploadPath = path.join(process.cwd(), 'uploads', fileName);
  
  const allowedImageTypes = ['image/jpeg', 'image/png'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (![...allowedImageTypes, ...allowedVideoTypes].includes(file.mimetype)) {
    throw new Error('Буруу төрлийн файл. Зөвхөн JPEG, PNG, болон MP4 файл оруулна уу.');
  }

  if (file.size > maxSize) {
    throw new Error('Файл хэт том байна. Дээд хэмжээ 100MB байх ёстой.');
  }

  const isVideo = file.mimetype.startsWith('video/');
  
  if (isVideo) {
    await file.mv(uploadPath);
  } else {
    const imageProcessor = sharp(file.data)
      .resize(1024, 768, {
        fit: 'inside',
        withoutEnlargement: true
      });

    const ext = path.extname(file.name).toLowerCase();
    if (ext === '.png') {
      await imageProcessor.png({ quality: 75 }).toFile(uploadPath);
    } else {
      await imageProcessor.jpeg({ quality: 75 }).toFile(uploadPath);
    }
  }
    
  return {
    url: `/uploads/${fileName}`,
    type: isVideo ? 'video' : 'image'
  };
};

const createRestaurant = asyncErrorHandle(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, location, description, districtId } = req.body;
  let mediaUrl = null;
  let mediaType = null;

  if (req.files?.media) {
    try {
      const uploadResult = await uploadMedia(req.files.media);
      mediaUrl = uploadResult.url;
      mediaType = uploadResult.type;
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      location,
      description,
      imageUrl: mediaUrl,
      mediaType,
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

  let mediaUrl = restaurant.imageUrl;
  let mediaType = restaurant.mediaType;

  if (req.files && req.files.media) {
    try {
      const uploadResult = await uploadMedia(req.files.media);
      mediaUrl = uploadResult.url;
      mediaType = uploadResult.type;
      if (restaurant.imageUrl) {
        const oldMediaPath = path.join(process.cwd(), restaurant.imageUrl);
        if (fs.existsSync(oldMediaPath)) {
          fs.unlinkSync(oldMediaPath);
        }
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  const updatedRestaurant = await prisma.restaurant.update({
    where: { id: parseInt(id) },
    data: {
      name,
      location,
      description,
      imageUrl: mediaUrl,
      mediaType,
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

    // Delete media if exists
    if (restaurant.imageUrl) {
      const mediaPath = path.join(process.cwd(), restaurant.imageUrl);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
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
