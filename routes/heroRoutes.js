const express = require("express");
const {body} = require("express-validator");
const router = express.Router();
const {auth, authorize} = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");

const {
  getAllHeroes,
  getHeroById,
  createHero,
  approveHero,
  rejectHero,
  updateHero,
  deleteHero,
} = require("../controllers/heroController");

const heroValidation = [
  body("content").trim().notEmpty().withMessage("Content is required"),
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

router.get("/", getAllHeroes);
router.get("/:id", getHeroById);
router.post(
  "/",
  auth,
  authorize("create", "Hero"),
  upload.single("file"),
  heroValidation,
  createHero
);

router.patch("/:id/approve", auth, authorize("update", "Hero"), approveHero);

router.patch("/:id/reject", auth, authorize("update", "Hero"), rejectHero);

router.put(
  "/:id",
  auth,
  authorize("update", "Hero"),
  heroValidation,
  updateHero
);

router.delete("/:id", auth, authorize("delete", "Hero"), deleteHero);

module.exports = router;
