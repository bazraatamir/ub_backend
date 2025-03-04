const express = require("express");
const router = express.Router();
const environmentController = require("../controllers/environmentController");

router.get("/", environmentController.getAllEnvironments);
router.get("/:id", environmentController.getEnvironmentById);
router.post("/", environmentController.createEnvironment);
router.put("/:id", environmentController.updateEnvironment);
router.delete("/:id", environmentController.deleteEnvironment);

module.exports = router;
