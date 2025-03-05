const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllDistricts = asyncErrorHandle(async (req, res, next) => {
  const districts = await prisma.district.findMany({
    include: {restaurants: true},
  });
  res.json(districts);
});

exports.getDistrictById = asyncErrorHandle(async (req, res, next) => {
  const {id} = req.params;
  const district = await prisma.district.findUnique({
    where: {id: Number(id)},
    include: {restaurants: true},
  });

  if (!district) {
    return res.status(404).json({error: "District not found"});
  }

  res.json(district);
});

exports.createDistrict = asyncErrorHandle(async (req, res, next) => {
  const {name, description} = req.body;
  const district = await prisma.district.create({
    data: {name, description},
  });
  res.status(201).json(district);
});

exports.updateDistrict = asyncErrorHandle(async (req, res, next) => {
  const {id} = req.params;
  const {name, description} = req.body;
  const district = await prisma.district.update({
    where: {id: Number(id)},
    data: {name, description},
  });
  res.json(district);
});

exports.deleteDistrict = asyncErrorHandle(async (req, res, next) => {
  const {id} = req.params;
  await prisma.district.delete({
    where: {id: Number(id)},
  });
  res.json({message: "District deleted successfully"});
});
