const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const districtRoutes = require("./routes/districtRoutes");
const environmentRoutes = require("./routes/environmentRoutes");
const menuRoutes = require("./routes/menuRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const signatureDishRoutes = require("./routes/signatureDishRoutes");
const tagRoutes = require("./routes/tagRoutes");
const restaurantTagRoutes = require("./routes/restaurantTagRoutes");
const highlightRoutes = require("./routes/highlightRoutes");
const heroRoutes = require("./routes/heroRoutes");

const app = express();
const prisma = new PrismaClient();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware configuration
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    useTempFiles: false, // Don't use temp files
    debug: true,
    abortOnLimit: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/environments", environmentRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/signature-dishes", signatureDishRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/restaurant-tags", restaurantTagRoutes);
app.use("/api/highlights", highlightRoutes);
app.use("/api/heros", heroRoutes);

// Serve uploads directory
app.use("/uploads", express.static(uploadDir));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
