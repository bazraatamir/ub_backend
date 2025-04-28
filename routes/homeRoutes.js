const express = require("express");
const router = express.Router();
const { upload, handleUploadError } = require("../middleware/videoMiddleware");
const {
  createVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
} = require("../controllers/homeController");

router.post("/", upload.single("video"), handleUploadError, createVideo);

router.get("/", getAllVideos);

router.get("/:id", getVideoById);

router.delete("/:id", deleteVideo);

module.exports = router;
