const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItemController");
const { auth } = require("../middleware/auth");

router.get("/", menuItemController.getAllMenuItems);
router.get("/:id", menuItemController.getMenuItemById);
router.post("/", auth, menuItemController.createMenuItem);
router.put("/:id", auth, menuItemController.updateMenuItem);
router.delete("/:id", auth, menuItemController.deleteMenuItem);

module.exports = router;
