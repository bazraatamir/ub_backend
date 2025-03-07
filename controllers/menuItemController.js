const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const asyncErrorHandle = require("../middleware/asyncHandler");
const sharp = require("sharp");

const uploadMedia = async (file) => {
  const fileName = `${Date.now()}${path.extname(file.name)}`;
  const uploadPath = path.join(process.cwd(), "uploads", fileName);
  
  const allowedImageTypes = ['image/jpeg', 'image/png'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime'];
  const maxSize = 100 * 1024 * 1024;

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

  const menuItem = await prisma.menuItem.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      imageUrl: mediaUrl,
      mediaType,
      menuId: parseInt(menuId)
    }
  });
  res.status(201).json(menuItem);
});

exports.updateMenuItem = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const menuItem = await prisma.menuItem.findUnique({ where: { id: parseInt(id) } });
  if (!menuItem) return res.status(404).json({ error: "Menu item not found" });

  if (req.files?.imageUrl) deleteImage(menuItem.imageUrl);
  const imageUrl = req.files?.imageUrl ? uploadMedia(req.files.imageUrl) : menuItem.imageUrl;

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
