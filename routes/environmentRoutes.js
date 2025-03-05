const express = require("express");
const router = express.Router();
const environmentController = require("../controllers/environmentController");
const upload = require("../middleware/upload");
const { auth } = require("../middleware/auth");

router.get("/", environmentController.getAllEnvironments);
router.get("/:id", environmentController.getEnvironmentById);
router.post("/", auth, upload.single('image'), environmentController.createEnvironment);
router.put("/:id", auth, upload.single('image'), environmentController.updateEnvironment);
router.delete("/:id", auth, environmentController.deleteEnvironment);

module.exports = router;
