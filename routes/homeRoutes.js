const express = require("express");
const router = express.Router();
const { upload, handleUploadError } = require("../middleware/videoMiddleware");
const {
  createVideo,
  getAllVideos,
  getVideoById,
  deleteVideo,
  approveVideo,
  getApprovedVideos,
} = require("../controllers/homeController");

router.post("/", upload.single("video"), handleUploadError, createVideo);

router.get("/", getAllVideos);

router.get("/approved", getApprovedVideos);

router.get("/:id", getVideoById);

router.delete("/:id", deleteVideo);

router.post("/:id/approve", approveVideo);

module.exports = router;
