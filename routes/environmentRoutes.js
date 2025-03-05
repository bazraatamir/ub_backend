const express = require("express");
const router = express.Router();
const environmentController = require("../controllers/environmentController");
const { auth } = require("../middleware/auth");

router.get("/", environmentController.getAllEnvironments);
router.get("/:id", environmentController.getEnvironmentById);
router.post("/", auth, environmentController.createEnvironment);
router.put("/:id", auth, environmentController.updateEnvironment);
router.delete("/:id", auth, environmentController.deleteEnvironment);

module.exports = router;
