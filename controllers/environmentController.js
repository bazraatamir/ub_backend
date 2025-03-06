const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const asyncErrorHandle = require("../middleware/asyncHandler");

const getFilePath = (fileName) => path.join(process.cwd(), "uploads", fileName);
const uploadImage = (file) => {
  const fileName = `${Date.now()}${path.extname(file.name)}`;
  fs.writeFileSync(getFilePath(fileName), file.data);
  return `/uploads/${fileName}`;
};

const deleteImage = (imageUrl) => {
  const fullPath = getFilePath(path.basename(imageUrl));
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

const findEnvironment = async (id) => prisma.environment.findUnique({ where: { id: parseInt(id) } });

exports.getAllEnvironments = asyncErrorHandle(async (req, res) => {
  const environments = await prisma.environment.findMany({ include: { restaurant: true } });
  res.json(environments);
});

exports.getEnvironmentById = asyncErrorHandle(async (req, res) => {
  const environment = await findEnvironment(req.params.id);
  if (!environment) return res.status(404).json({ error: "Environment not found" });
  res.json(environment);
});

exports.createEnvironment = asyncErrorHandle(async (req, res) => {
  const { description, restaurantId } = req.body;
  const imageUrl = req.files?.imageUrl ? uploadImage(req.files.imageUrl) : null;
  const environment = await prisma.environment.create({
    data: { imageUrl, description, restaurantId: parseInt(restaurantId) },
  });
  res.status(201).json(environment);
});

exports.updateEnvironment = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  const oldEnvironment = await findEnvironment(id);
  if (!oldEnvironment) return res.status(404).json({ error: "Environment not found" });

  if (req.files?.imageUrl) {
    if (oldEnvironment.imageUrl) deleteImage(oldEnvironment.imageUrl);
    oldEnvironment.imageUrl = uploadImage(req.files.imageUrl);
  }

  const environment = await prisma.environment.update({
    where: { id: parseInt(id) },
    data: { imageUrl: oldEnvironment.imageUrl, description },
  });

  res.json(environment);
});

exports.deleteEnvironment = asyncErrorHandle(async (req, res) => {
  const environment = await findEnvironment(req.params.id);
  if (!environment) return res.status(404).json({ error: "Environment not found" });

  if (environment.imageUrl) deleteImage(environment.imageUrl);
  await prisma.environment.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: "Environment deleted successfully" });
});
