const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");

exports.getAllHeroes = asyncErrorHandle(async (req, res) => {
  const { status } = req.query;
  const whereClause = status ? { status: status.toUpperCase() } : {};

  const heroes = await prisma.hero.findMany({
    where: whereClause,
    include: { restaurant: true },
  });
  res.json(heroes);
});

exports.getHeroById = asyncErrorHandle(async (req, res) => {
  const hero = await prisma.hero.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { restaurant: true },
  });
  if (!hero) return res.status(404).json({ error: "Hero not found" });
  res.json(hero);
});

exports.createHero = asyncErrorHandle(async (req, res) => {
  const { restaurantId } = req.body;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parseInt(restaurantId) },
  });
  if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

  if (restaurant.userId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Not authorized" });
  }

  const hero = await prisma.hero.create({
    data: {
      restaurantId: parseInt(restaurantId),
      status: "PENDING",
    },
    include: { restaurant: true },
  });
  res.status(201).json(hero);
});

exports.approveHero = asyncErrorHandle(async (req, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admins only" });

  const hero = await prisma.hero.findUnique({
    where: { id: parseInt(req.params.id) },
  });
  if (!hero) return res.status(404).json({ error: "Hero not found" });

  const updatedHero = await prisma.hero.update({
    where: { id: parseInt(req.params.id) },
    data: {
      status: "APPROVED",
      approvedBy: req.user.id,
      approvedAt: new Date(),
    },
    include: { restaurant: true },
  });
  res.json({ message: "Hero approved", hero: updatedHero });
});

exports.rejectHero = asyncErrorHandle(async (req, res) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admins only" });

  const hero = await prisma.hero.findUnique({
    where: { id: parseInt(req.params.id) },
  });
  if (!hero) return res.status(404).json({ error: "Hero not found" });

  const updatedHero = await prisma.hero.update({
    where: { id: parseInt(req.params.id) },
    data: {
      status: "REJECTED",
      approvedBy: req.user.id,
      approvedAt: new Date(),
    },
    include: { restaurant: true },
  });
  res.json({ message: "Hero rejected", hero: updatedHero });
});

exports.updateHero = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;

  const hero = await prisma.hero.findUnique({
    where: { id: parseInt(id) },
    include: { restaurant: true },
  });
  if (!hero) return res.status(404).json({ error: "Hero not found" });

  if (hero.restaurant.userId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Not authorized" });
  }

  const updatedHero = await prisma.hero.update({
    where: { id: parseInt(id) },
    data: {},
    include: { restaurant: true },
  });
  res.json(updatedHero);
});

exports.deleteHero = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;

  const hero = await prisma.hero.findUnique({
    where: { id: parseInt(id) },
    include: { restaurant: true },
  });
  if (!hero) return res.status(404).json({ error: "Hero not found" });

  if (hero.restaurant.userId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Not authorized" });
  }

  await prisma.hero.delete({
    where: { id: parseInt(id) },
  });
  res.json({ message: "Hero deleted successfully" });
});