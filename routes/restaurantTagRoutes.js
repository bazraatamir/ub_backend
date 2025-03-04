const express = require("express");
const router = express.Router();
const restaurantTagController = require("../controllers/restaurantTagController");

// Get all restaurant tags
router.get("/", restaurantTagController.getAllRestaurantTags);

// Get tags by restaurant
router.get(
  "/restaurant/:restaurantId",
  restaurantTagController.getTagsByRestaurant
);

// Get restaurants by tag
router.get("/tag/:tagId", restaurantTagController.getRestaurantsByTag);

// Add tag to restaurant
router.post("/", restaurantTagController.addTagToRestaurant);

// Remove tag from restaurant
router.delete(
  "/:restaurantId/:tagId",
  restaurantTagController.removeTagFromRestaurant
);

module.exports = router;
