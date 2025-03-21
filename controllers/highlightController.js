const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");

exports.getAllHighlights = asyncErrorHandle(async (req, res) => {
  const { status } = req.query;
  const whereClause = {};

  if (req.user) {
    if (req.user.role === "USER") {
      whereClause.status = "APPROVED";
    } else if (status) {
      whereClause.status = status.toUpperCase();
    }
  } else {
    whereClause.status = "APPROVED";
  }

  const highlights = await prisma.highlight.findMany({
    where: whereClause,
    include: { restaurant: true },
  });
  res.json(highlights);
});

exports.getHighlightById = asyncErrorHandle(async (req, res) => {
  const highlight = await prisma.highlight.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { restaurant: true },
  });
  if (!highlight) return res.status(404).json({ error: "Highlight not found" });

  if (!req.ability.can("read", highlight)) {
    return res.status(403).json({ error: "Not authorized to read this highlight" });
  }
  res.json(highlight);
});

exports.createHighlight = asyncErrorHandle(async (req, res) => {
  const { restaurantId } = req.body;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parseInt(restaurantId) },
  });
  if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

  const highlight = await prisma.highlight.create({
    data: {
      restaurantId: parseInt(restaurantId),
      status: "PENDING",
    },
    include: { restaurant: true },
  });
  res.status(201).json(highlight);
});

exports.approveHighlight = asyncErrorHandle(async (req, res) => {
  const highlight = await prisma.highlight.findUnique({
    where: { id: parseInt(req.params.id) },
  });
  if (!highlight) return res.status(404).json({ error: "Highlight not found" });

  const updatedHighlight = await prisma.highlight.update({
    where: { id: parseInt(req.params.id) },
    data: {
      status: "APPROVED",
      approvedBy: req.user.id,
      approvedAt: new Date(),
    },
    include: { restaurant: true },
  });
  res.json({ message: "Highlight approved", highlight: updatedHighlight });
});

exports.rejectHighlight = asyncErrorHandle(async (req, res) => {
  const highlight = await prisma.highlight.findUnique({
    where: { id: parseInt(req.params.id) },
  });
  if (!highlight) return res.status(404).json({ error: "Highlight not found" });

  const updatedHighlight = await prisma.highlight.update({
    where: { id: parseInt(req.params.id) },
    data: {
      status: "REJECTED",
      approvedBy: req.user.id,
      approvedAt: new Date(),
    },
    include: { restaurant: true },
  });
  res.json({ message: "Highlight rejected", highlight: updatedHighlight });
});

exports.updateHighlight = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;

  const highlight = await prisma.highlight.findUnique({
    where: { id: parseInt(id) },
    include: { restaurant: true },
  });
  if (!highlight) return res.status(404).json({ error: "Highlight not found" });

  const updatedHighlight = await prisma.highlight.update({
    where: { id: parseInt(id) },
    data: {},
    include: { restaurant: true },
  });
  res.json(updatedHighlight);
});

exports.deleteHighlight = asyncErrorHandle(async (req, res) => {
  const { id } = req.params;

  const highlight = await prisma.highlight.findUnique({
    where: { id: parseInt(id) },
  });
  if (!highlight) return res.status(404).json({ error: "Highlight not found" });

  await prisma.highlight.delete({
    where: { id: parseInt(id) },
  });
  res.json({ message: "Highlight deleted successfully" });
});