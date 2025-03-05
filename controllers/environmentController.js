const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

exports.getAllEnvironments = async (req, res) => {
  try {
    const environments = await prisma.environment.findMany({
      include: {
        restaurant: true,
      },
    });
    res.json(environments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEnvironmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const environment = await prisma.environment.findUnique({
      where: { id: parseInt(id) },
      include: {
        restaurant: true,
      },
    });

    if (!environment) {
      return res.status(404).json({ error: "Environment not found" });
    }

    res.json(environment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEnvironment = async (req, res) => {
  try {
    const { description, restaurantId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image is required" });
    }

    const environment = await prisma.environment.create({
      data: {
        imageUrl,
        description,
        restaurantId: parseInt(restaurantId),
      },
    });
    res.status(201).json(environment);
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateEnvironment = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    
    const oldEnvironment = await prisma.environment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!oldEnvironment) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "Environment not found" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : oldEnvironment.imageUrl;

    const environment = await prisma.environment.update({
      where: { id: parseInt(id) },
      data: {
        imageUrl,
        description,
      },
    });

    // Delete old image if new image was uploaded
    if (req.file && oldEnvironment.imageUrl) {
      const oldImagePath = path.join(__dirname, '..', oldEnvironment.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    res.json(environment);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEnvironment = async (req, res) => {
  try {
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
      const imagePath = path.join(__dirname, '..', environment.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: "Environment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
