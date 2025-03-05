const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const asyncErrorHandle = require("../middleware/asyncHandler");

exports.getAllMenuItems = asyncErrorHandle(async (req, res) => {
    const menuItems = await prisma.menuItem.findMany({
      include: {menu: true,},
    });
    res.json(menuItems);
});

exports.getMenuItemById = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) },
      include: {menu: true,},
    });
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(menuItem);
});

exports.createMenuItem = asyncErrorHandle(async (req, res) => {
    const { name, description, price, menuId } = req.body;
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

    const menuItem = await prisma.menuItem.create({
        data: {
            name,
            description,
            price: parseFloat(price),
            imageUrl,
            menuId: parseInt(menuId),
        },
    });
    res.status(201).json(menuItem);
});

exports.updateMenuItem = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;

    const oldMenuItem = await prisma.menuItem.findUnique({
        where: { id: parseInt(id) }
    });

    if (!oldMenuItem) {
        return res.status(404).json({ error: "Menu item not found" });
    }

    let imageUrl = oldMenuItem.imageUrl;

    if (req.files && req.files.imageUrl) {
        const file = req.files.imageUrl;
        const fileExt = path.extname(file.name);
        const fileName = Date.now() + fileExt;
        const uploadPath = path.join(process.cwd(), 'uploads', fileName);
        
        const imageBuffer = Buffer.from(file.data);
        fs.writeFileSync(uploadPath, imageBuffer);
        
        imageUrl = `/uploads/${fileName}`;

        if (oldMenuItem.imageUrl) {
            const oldImagePath = path.join(__dirname, '..', oldMenuItem.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
    }

    const menuItem = await prisma.menuItem.update({
        where: { id: parseInt(id) },
        data: {
            name,
            description,
            price: price ? parseFloat(price) : undefined,
            imageUrl,
        },
    });
    res.json(menuItem);
});

exports.deleteMenuItem = asyncErrorHandle(async (req, res) => {
    const { id } = req.params;
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    await prisma.menuItem.delete({
      where: { id: parseInt(id) },
    });
    if (menuItem.imageUrl) {
      const imagePath = path.join(__dirname, '..', menuItem.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.json({ message: "Menu item deleted successfully" });
});
