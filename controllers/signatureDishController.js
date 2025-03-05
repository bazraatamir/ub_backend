const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");
const path = require("path");
const fs = require("fs");

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

exports.createSignatureDish = asyncErrorHandle(async (req, res) => {
    const { name, description, restaurantId } = req.body;
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
    
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    const signatureDish = await prisma.signatureDish.create({
        data: {
            name,
            description,
            imageUrl,
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
        const fileExt = path.extname(file.name);
        const fileName = Date.now() + fileExt;
        const uploadPath = path.join(process.cwd(), 'uploads', fileName);
        
        const imageBuffer = Buffer.from(file.data);
        fs.writeFileSync(uploadPath, imageBuffer);
        
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
