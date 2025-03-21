const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { auth } = require("../middleware/auth");

router.get("/", menuController.getAllMenus);
router.get("/restaurant/:restaurantId", menuController.getMenusByRestaurant);
router.get("/:id", menuController.getMenuById);

router.post("/", auth, menuController.createMenu);
router.put("/:id", auth, menuController.updateMenu);
router.delete("/:id", auth, menuController.deleteMenu);

module.exports = router;
