const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { auth } = require("../middleware/auth");

// Public routes
router.get("/restaurant/:restaurantId", menuController.getMenusByRestaurant);
router.get("/:id", menuController.getMenuById);

// Protected routes - need authentication
router.post("/", auth, menuController.createMenu);
router.put("/:id", auth, menuController.updateMenu);
router.delete("/:id", auth, menuController.deleteMenu);

module.exports = router;
