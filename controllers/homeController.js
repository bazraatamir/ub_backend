const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const asyncErrorHandle = require("../middleware/asyncHandler");

const getFilePath = (fileName) => path.join(process.cwd(), "uploads", fileName);

const deleteVideo = (videoUrl) => {
  const fullPath = getFilePath(path.basename(videoUrl));
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

exports.createVideo = asyncErrorHandle(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Файл оруулаагүй байна" });
  }

  try {
    const video = await prisma.home.create({
      data: {
        videoUrl: `/uploads/${req.file.filename}`,
      },
    });
    res.status(201).json({
      message: "Видео амжилттай орууллаа",
      data: video,
    });
  } catch (error) {
    return res.status(400).json({ error: "Видео оруулахад алдаа гарлаа" });
  }
});

exports.getAllVideos = asyncErrorHandle(async (req, res) => {
  const videos = await prisma.home.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  res.json({
    message: "Бүх видеонууд",
    data: videos,
  });
});

exports.getVideoById = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const video = await prisma.home.findUnique({
    where: { id: parseInt(id) },
  });

  if (!video) {
    return res.status(404).json({ error: "Видео олдсонгүй" });
  }

  res.json({
    message: "Видео мэдээлэл",
    data: video,
  });
});

exports.deleteVideo = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const video = await prisma.home.findUnique({
    where: { id: parseInt(id) },
  });

  if (!video) {
    return res.status(404).json({ error: "Видео олдсонгүй" });
  }

  deleteVideo(video.videoUrl);
  await prisma.home.delete({
    where: { id: parseInt(id) },
  });

  res.json({
    message: "Видео амжилттай устгагдлаа",
    data: null,
  });
});
