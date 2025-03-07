const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

exports.getAllSignatureDishes = asyncErrorHandle(async (req, res) => {
    const signatureDishes = await prisma.signatureDish.findMany({
      include: {restaurant: true,},
    });
    res.json(signatureDishes);
});

exports.getSignatureDishById = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    const signatureDish = await prisma.signatureDish.findUnique({
      where: { id: parseInt(id) },
      include: {restaurant: true,},
    });

    if (!signatureDish) {
      return res.status(404).json({ error: "Signature dish not found" });
    }

    res.json(signatureDish);
});

const uploadMedia = async (file) => {
  const fileName = `${Date.now()}${path.extname(file.name)}`;
  const uploadPath = path.join(process.cwd(), 'uploads', fileName);
  
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

exports.createSignatureDish = asyncErrorHandle(async (req, res) => {
  const { name, description, restaurantId } = req.body;
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

  const signatureDish = await prisma.signatureDish.create({
    data: {
      name,
      description,
      imageUrl: mediaUrl,
      mediaType,
      restaurantId: parseInt(restaurantId),
    },
  });
  res.status(201).json(signatureDish);
});

exports.updateSignatureDish = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const oldDish = await prisma.signatureDish.findUnique({
        where: { id: parseInt(id) }
    });

    if (!oldDish) {
        return res.status(404).json({ error: "Signature dish not found" });
    }

    let imageUrl = oldDish.imageUrl;

    if (req.files && req.files.imageUrl) {
        const file = req.files.imageUrl;
        const fileName = Date.now() + path.extname(file.name);
        const uploadPath = path.join(process.cwd(), 'uploads', fileName);
        
        const imageProcessor = sharp(file.data)
          .resize(1024, 768, {
            fit: 'inside',
            withoutEnlargement: true
          });

        const ext = path.extname(file.name).toLowerCase();
        if (ext === '.png') {
          await imageProcessor
            .png({ quality: 75 })
            .toFile(uploadPath);
        } else {
          await imageProcessor
            .jpeg({ quality: 75 })
            .toFile(uploadPath);
        }
        
        imageUrl = `/uploads/${fileName}`;

        if (oldDish.imageUrl) {
            const oldImagePath = path.join(__dirname, '..', oldDish.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
    }

    const signatureDish = await prisma.signatureDish.update({
        where: { id: parseInt(id) },
        data: { name, description, imageUrl },
    });

    res.json(signatureDish);
});

exports.deleteSignatureDish = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    await prisma.signatureDish.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Signature dish deleted successfully" });
});
