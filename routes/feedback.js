const express = require("express");
const {body} = require("express-validator");
const router = express.Router();
const {auth, authorize} = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");
const {
  createFeedback,
  getRestaurantFeedback,
  getOwnerFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} = require("../controllers/feedbackController");

const feedbackValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("message").trim().notEmpty().withMessage("Message is required"),
  body("restaurantId")
    .isInt()
    .withMessage("Invalid restaurant ID")
    .custom(async (value) => {
      const restaurant = await prisma.restaurant.findUnique({
        where: {id: parseInt(value)},
      });
      if (!restaurant) throw new Error("Restaurant not found");
      return true;
    }),
];

// Create new feedback
router.post(
  "/",
  feedbackValidation,
  createFeedback
);

// Get all feedback for a specific restaurant
router.get(
  "/restaurant/:restaurantId",
  getRestaurantFeedback
);

// Get all feedback for restaurant owner's restaurants
router.get("/owner", auth, authorize("read", "Feedback"), getOwnerFeedback);

// Update feedback status
router.put(
  "/:id/status",
  auth,
  authorize("update", "Feedback"),
  updateFeedbackStatus
);

// Delete feedback
router.delete("/:id", auth, authorize("delete", "Feedback"), deleteFeedback);

module.exports = router;
