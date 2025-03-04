const express = require("express");
const router = express.Router();
const signatureDishController = require("../controllers/signatureDishController");

router.get("/", signatureDishController.getAllSignatureDishes);
router.get("/:id", signatureDishController.getSignatureDishById);
router.post("/", signatureDishController.createSignatureDish);
router.put("/:id", signatureDishController.updateSignatureDish);
router.delete("/:id", signatureDishController.deleteSignatureDish);

module.exports = router;
