const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");
const {
  getAllHighlights,
  getHighlightById,
  createHighlight,
  approveHighlight,
  rejectHighlight,
  updateHighlight,
  deleteHighlight,
} = require("../controllers/highlightController");

const highlightValidation = [
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("restaurantId")
    .isInt()
    .withMessage("Invalid restaurant ID")
    .custom(async (value) => {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: parseInt(value) },
      });
      if (!restaurant) throw new Error("Restaurant not found");
      return true;
    }),
];

router.get("/",auth,authorize("read", "Highlight"), getAllHighlights);

router.get("/:id",auth,authorize("read", "Highlight"), getHighlightById);

router.post(
  "/",
  auth,
  authorize("create", "Highlight"),
  highlightValidation,
  createHighlight
);

router.patch(
  "/:id/approve",
  auth,
  authorize("update", "Highlight"),
  approveHighlight
);

router.patch(
  "/:id/reject",
  auth,
  authorize("update", "Highlight"),
  rejectHighlight
);

router.put(
  "/:id",
  auth,
  authorize("update", "Highlight"),
  highlightValidation,
  updateHighlight
);

router.delete("/:id", auth, authorize("delete", "Highlight"), deleteHighlight);

module.exports = router;