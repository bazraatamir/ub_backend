const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItemController");
const upload = require("../middleware/upload");
const { auth } = require("../middleware/auth");

router.get("/", menuItemController.getAllMenuItems);
router.get("/:id", menuItemController.getMenuItemById);
router.post("/", auth, upload.single('image'), menuItemController.createMenuItem);
router.put("/:id", auth, upload.single('image'), menuItemController.updateMenuItem);
router.delete("/:id", auth, menuItemController.deleteMenuItem);

module.exports = router;
