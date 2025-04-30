const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
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
const highlightRoutes = require("./routes/highlightRoutes");
const heroRoutes = require("./routes/heroRoutes");
const cookieParser = require("cookie-parser");
const feedbackRoutes = require("./routes/feedback");
const homeRoutes = require("./routes/homeRoutes");

const app = express();
app.use(cookieParser());

const prisma = new PrismaClient();

const whitelist = [
  "http://localhost:5173",
  "https://azjargaliinsodsolongo.com/",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/environments", environmentRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/menuitems", menuItemRoutes);
app.use("/api/signature-dishes", signatureDishRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/restaurant-tags", restaurantTagRoutes);
app.use("/api/highlights", highlightRoutes);
app.use("/api/heros", heroRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/home", homeRoutes);

app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.log(err);
  const statusCode = err.status || 500;

  const errorDetails = {
    error: true,
    message: err.message || "Internal Server Error",
    statusCode,
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production") {
    errorDetails.stack = err.stack;
  }

  // console.error("Error occurred:", errorDetails);
  res.status(statusCode).json(errorDetails);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
