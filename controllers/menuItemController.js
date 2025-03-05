const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        menu: true,
      },
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        menu: true,
      },
    });

    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, menuId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

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
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    const oldMenuItem = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!oldMenuItem) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "Menu item not found" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : oldMenuItem.imageUrl;

    const menuItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        imageUrl,
      },
    });

    // Delete old image if new image was uploaded
    if (req.file && oldMenuItem.imageUrl) {
      const oldImagePath = path.join(__dirname, '..', oldMenuItem.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    res.json(menuItem);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
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

    // Delete image file
    if (menuItem.imageUrl) {
      const imagePath = path.join(__dirname, '..', menuItem.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
