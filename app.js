const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const districtRoutes = require("./routes/districtRoutes");
const environmentRoutes = require("./routes/environmentRoutes");
const menuRoutes = require("./routes/menuRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const signatureDishRoutes = require("./routes/signatureDishRoutes");
const tagRoutes = require("./routes/tagRoutes");
const restaurantTagRoutes = require("./routes/restaurantTagRoutes");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/environments", environmentRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/signature-dishes", signatureDishRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/restaurant-tags", restaurantTagRoutes);

app.use('/uploads', express.static('uploads'));

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
