const express = require("express");
const router = express.Router();
const restaurantTagController = require("../controllers/restaurantTagController");
const { auth } = require("../middleware/auth")

router.get("/", restaurantTagController.getAllRestaurantTags);

router.get(
  "/restaurant/:restaurantId",
  restaurantTagController.getTagsByRestaurant
);

router.get("/tag/:tagId", restaurantTagController.getRestaurantsByTag);

router.post("/",auth, restaurantTagController.addTagToRestaurant);

router.delete(
  "/:restaurantId/:tagId",
  restaurantTagController.removeTagFromRestaurant
);

module.exports = router;
