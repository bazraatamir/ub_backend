const express = require("express");
const { body } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const router = express.Router();

// Validation middleware
const restaurantValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("description").optional().trim(),
  body("imageUrl").optional().trim().isURL().withMessage("Invalid image URL"),
  body("districtId").optional().isInt().withMessage("Invalid district ID"),
];

// Routes
router.post(
  "/",
  auth,
  authorize(["RESTAURANT_OWNER", "ADMIN"]),
  restaurantValidation,
  createRestaurant
);

router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);

router.put(
  "/:id",
  auth,
  authorize(["RESTAURANT_OWNER", "ADMIN"]),
  restaurantValidation,
  updateRestaurant
);

router.delete(
  "/:id",
  auth,
  authorize(["RESTAURANT_OWNER", "ADMIN"]),
  deleteRestaurant
);

module.exports = router;
