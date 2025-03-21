const express = require("express");
const { body } = require("express-validator");
const { auth, authorize } = require("../middleware/auth");
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
} = require("../controllers/restaurantController");

const router = express.Router();

const restaurantValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("description").optional().trim(),
  body("imageUrl").optional().trim().isURL().withMessage("Invalid image URL"),
  body("districtId").optional().isInt().withMessage("Invalid district ID"),
];

router.post(
  "/",
  auth,
  authorize(["RESTAURANT_OWNER", "ADMIN"]),
  restaurantValidation,
  createRestaurant
);

router.post(
  "/:id/approve",
  auth,
  authorize(["ADMIN"]),
  approveRestaurant
);

router.get("/", auth, getAllRestaurants);
router.get("/:id", auth, getRestaurantById);

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