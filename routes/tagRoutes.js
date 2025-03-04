const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");

router.get("/", tagController.getAllTags);
router.get("/:id", tagController.getTagById);
router.post("/", tagController.createTag);
router.put("/:id", tagController.updateTag);
router.delete("/:id", tagController.deleteTag);

// Restaurant Tag Relations
router.post("/restaurant", tagController.addTagToRestaurant);
router.delete(
  "/restaurant/:restaurantId/:tagId",
  tagController.removeTagFromRestaurant
);

module.exports = router;
