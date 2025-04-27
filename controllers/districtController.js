const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");

const findDistrict = async (id) =>
  prisma.district.findUnique({
    where: {id: Number(id)},
    include: {restaurants: true},
  });

exports.getAllDistricts = asyncErrorHandle(async (req, res) => {
  const districts = await prisma.district.findMany({
    include: {restaurants: true},
  });
  res.json(districts);
});

exports.getDistrictById = asyncErrorHandle(async (req, res) => {
  const district = await findDistrict(req.params.id);
  if (!district) return res.status(404).json({error: "District not found"});
  res.json(district);
});

exports.createDistrict = asyncErrorHandle(async (req, res) => {
  const {name, description} = req.body;
  const district = await prisma.district.create({data: {name, description}});
  res.status(201).json(district);
});

exports.updateDistrict = asyncErrorHandle(async (req, res) => {
  const {id} = req.params;
  const {name, description} = req.body;
  const district = await prisma.district.update({
    where: {id: Number(id)},
    data: {name, description},
  });
  res.json(district);
});

exports.deleteDistrict = asyncErrorHandle(async (req, res) => {
  const district = await findDistrict(req.params.id);
  if (!district) return res.status(404).json({error: "District not found"});
  await prisma.district.delete({where: {id: Number(req.params.id)}});
  res.json({message: "District deleted successfully"});
});
