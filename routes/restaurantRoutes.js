const express = require("express");
const {body} = require("express-validator");
const {auth, authorize} = require("../middleware/auth");
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
  getRestaurantByUserId,
} = require("../controllers/restaurantController");
const upload = require("../middleware/uploadMiddleware");
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
  authorize("create", "Restaurant"),
  // restaurantValidation,
  upload.single("file"),
  createRestaurant
);

router.post("/:id/approve", auth, authorize(["ADMIN"]), approveRestaurant);

router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);
router.get("/user/:id");

router.put(
  "/:id",
  auth,
  authorize(["RESTAURANT_OWNER", "ADMIN"]),
  upload.single("file"),
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
