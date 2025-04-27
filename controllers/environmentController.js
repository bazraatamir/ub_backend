const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const asyncErrorHandle = require("../middleware/asyncHandler");
const sharp = require("sharp");

const getFilePath = (fileName) => path.join(process.cwd(), "uploads", fileName);
const uploadMedia = async (file) => {
  const fileName = `${Date.now()}${path.extname(file.name)}`;
  const filePath = getFilePath(fileName);
  const allowedImageTypes = ["image/jpeg", "image/png"];
  const allowedVideoTypes = ["video/mp4", "video/quicktime"];
  const maxSize = 100 * 1024 * 1024;

  if (![...allowedImageTypes, ...allowedVideoTypes].includes(file.mimetype)) {
    throw new Error(
      "Буруу төрлийн файл. Зөвхөн JPEG, PNG, болон MP4 файл оруулна уу."
    );
  }

  if (file.size > maxSize) {
    throw new Error("Файл хэт том байна. Дээд хэмжээ 100MB байх ёстой.");
  }

  const isVideo = file.mimetype.startsWith("video/");

  if (isVideo) {
    await file.mv(filePath);
  } else {
    const imageProcessor = sharp(file.data).resize(1024, 768, {
      fit: "inside",
      withoutEnlargement: true,
    });

    const ext = path.extname(file.name).toLowerCase();
    if (ext === ".png") {
      await imageProcessor.png({quality: 75}).toFile(filePath);
    } else {
      await imageProcessor.jpeg({quality: 75}).toFile(filePath);
    }
  }

  return {
    url: `/uploads/${fileName}`,
    type: isVideo ? "video" : "image",
  };
};

const deleteMedia = (mediaUrl) => {
  const fullPath = getFilePath(path.basename(mediaUrl));
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

const findEnvironment = async (id) =>
  prisma.environment.findUnique({where: {id: parseInt(id)}});

exports.getAllEnvironments = asyncErrorHandle(async (req, res) => {
  const environments = await prisma.environment.findMany({
    include: {restaurant: true},
  });
  res.json(environments);
});

exports.getEnvironmentById = asyncErrorHandle(async (req, res) => {
  const environment = await findEnvironment(req.params.id);
  if (!environment)
    return res.status(404).json({error: "Environment not found"});
  res.json(environment);
});

exports.createEnvironment = asyncErrorHandle(async (req, res) => {
  const {id} = req.user;
  console.log(req.file.filename);
  const restaurant = await prisma.restaurant.findFirst({
    where: {userId: parseInt(id)},
  });

  const environment = await prisma.environment.create({
    data: {
      imageUrl: req.file.filename,
      mediaType: req.file.mimetype,
      description: null,
      restaurantId: parseInt(restaurant.id),
    },
  });
  res.status(201).json(environment);
});

exports.updateEnvironment = asyncErrorHandle(async (req, res) => {
  const {id} = req.params;
  const {description} = req.body;

  const oldEnvironment = await findEnvironment(id);
  if (!oldEnvironment) {
    return res.status(404).json({error: "Орчин олдсонгүй"});
  }

  let imageUrl = oldEnvironment.imageUrl;
  let mediaType = oldEnvironment.mediaType;

  if (req.files?.media) {
    try {
      if (oldEnvironment.imageUrl) {
        deleteMedia(oldEnvironment.imageUrl);
      }

      const uploadResult = await uploadMedia(req.files.media);
      imageUrl = uploadResult.url;
      mediaType = uploadResult.type;
    } catch (error) {
      return res.status(400).json({error: error.message});
    }
  }

  const environment = await prisma.environment.update({
    where: {id: parseInt(id)},
    data: {
      imageUrl,
      mediaType,
      description,
    },
  });

  res.json(environment);
});

exports.deleteEnvironment = asyncErrorHandle(async (req, res) => {
  const environment = await findEnvironment(req.params.id);
  if (!environment)
    return res.status(404).json({error: "Environment not found"});

  if (environment.imageUrl) deleteMedia(environment.imageUrl);
  await prisma.environment.delete({where: {id: parseInt(req.params.id)}});
  res.json({message: "Environment deleted successfully"});
});
