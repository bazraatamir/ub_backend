const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const asyncErrorHandle = require("../middleware/asyncHandler");

exports.getAllEnvironments = asyncErrorHandle(async (req, res) => {
    const environments = await prisma.environment.findMany({
      include: {restaurant: true,},
    });
    res.json(environments);
});

exports.getEnvironmentById = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    const environment = await prisma.environment.findUnique({
      where: { id: parseInt(id) },
      include: {restaurant: true,},
    });
    if (!environment) {
      return res.status(404).json({ error: "Environment not found" });
    }
    res.json(environment);
});

exports.createEnvironment = asyncErrorHandle(async (req, res) => {
    const { description, restaurantId } = req.body;
    let imageUrl = null;

    if (req.files && req.files.imageUrl) {
        const file = req.files.imageUrl;
        const fileExt = path.extname(file.name);
        const fileName = Date.now() + fileExt;
        const uploadPath = path.join(process.cwd(), 'uploads', fileName);
        
        const imageBuffer = Buffer.from(file.data);
        fs.writeFileSync(uploadPath, imageBuffer);
        
        imageUrl = `/uploads/${fileName}`;
    }

    const environment = await prisma.environment.create({
        data: { imageUrl, description, restaurantId: parseInt(restaurantId) },
    });
    res.status(201).json(environment);
});

exports.updateEnvironment = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    
    const oldEnvironment = await prisma.environment.findUnique({
        where: { id: parseInt(id) }
    });

    if (!oldEnvironment) {
        return res.status(404).json({ error: "Environment not found" });
    }

    let imageUrl = oldEnvironment.imageUrl;

    if (req.files && req.files.imageUrl) {
        const file = req.files.imageUrl;
        const fileExt = path.extname(file.name);
        const fileName = Date.now() + fileExt;
        const uploadPath = path.join(process.cwd(), 'uploads', fileName);
        
        const imageBuffer = Buffer.from(file.data);
        fs.writeFileSync(uploadPath, imageBuffer);
        
        imageUrl = `/uploads/${fileName}`;

        if (oldEnvironment.imageUrl) {
            const oldImagePath = path.join(process.cwd(), oldEnvironment.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
    }

    const environment = await prisma.environment.update({
        where: { id: parseInt(id) },
        data: { imageUrl, description },
    });

    res.json(environment);
});

exports.deleteEnvironment = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    
    const environment = await prisma.environment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!environment) {
      return res.status(404).json({ error: "Environment not found" });
    }

    await prisma.environment.delete({
      where: { id: parseInt(id) },
    });

    // Delete image file
    if (environment.imageUrl) {
      const imagePath = path.join(process.cwd(), environment.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: "Environment deleted successfully" });
});
