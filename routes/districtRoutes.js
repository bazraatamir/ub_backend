const express = require("express");
const router = express.Router();
const districtController = require("../controllers/districtController");

router.get("/", districtController.getAllDistricts);
router.get("/:id", districtController.getDistrictById);
router.post("/", districtController.createDistrict);
router.put("/:id", districtController.updateDistrict);
router.delete("/:id", districtController.deleteDistrict);

module.exports = router;
