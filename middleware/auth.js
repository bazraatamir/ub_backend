const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { defineAbility } = require("@casl/ability");
const prisma = new PrismaClient();

const defineAbilitiesFor = (user) => {
  return defineAbility((can, cannot) => {
    can("read", "User", { id: user.id });

    if (user.role === "ADMIN") {
      can("manage", "all");
      can("approve", "Restaurant");
    } else if (user.role === "RESTAURANT_OWNER") {
      can("create", "Restaurant");
      can("read", "Restaurant", { userId: user.id });
      can("update", "Restaurant", { userId: user.id });
      can("delete", "Restaurant", { userId: user.id });

      can("create", "Highlight", { restaurant: { userId: user.id } });
      can("read", "Highlight", { restaurant: { userId: user.id } });
      can("update", "Highlight", { restaurant: { userId: user.id } });
      can("delete", "Highlight", { restaurant: { userId: user.id } });

      can("create", "Hero", { restaurant: { userId: user.id } });
      can("read", "Hero", { restaurant: { userId: user.id } });
      can("update", "Hero", { restaurant: { userId: user.id } });
      can("delete", "Hero", { restaurant: { userId: user.id } });

      can("manage", "Environment", { restaurant: { userId: user.id } });
      can("manage", "SignatureDish", { restaurant: { userId: user.id } });
      can("manage", "Menu", { restaurant: { userId: user.id } });
      can("manage", "MenuItem", { menu: { restaurant: { userId: user.id } } });
      can("manage", "RestaurantTag", { restaurant: { userId: user.id } });

      can("create", "Feedback");
      can("read", "Feedback", { restaurant: { userId: user.id } });
      can("update", "Feedback", { restaurant: { userId: user.id } });
      can("delete", "Feedback", { restaurant: { userId: user.id } });
    } else if (user.role === "USER") {
      can("read", "Restaurant", { status: "APPROVED" });
      can("read", "Highlight", { status: "APPROVED" });
      can("read", "Hero", { status: "APPROVED" });
      can("read", "District");
      can("read", "Tag");
      can("read", "Menu");
      can("read", "MenuItem");
      can("read", "SignatureDish");
      can("read", "Environment");

      can("create", "Feedback");
      can("read", "Feedback", { status: "APPROVED" });
    }

    if (user.role === "ADMIN") {
      can("update", "Highlight");
      can("update", "Hero");
      can("manage", "Feedback");
    }
  });
};

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.token = token;
    req.ability = defineAbilitiesFor(user);
    next();
  } catch (error) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

const authorize = (action, subject, conditions = null) => {
  return async (req, res, next) => {
    const ability = req.ability;

    if (conditions && typeof conditions === "function") {
      const resource = await conditions(req);
      if (!ability.can(action, resource)) {
        console.log(!ability.can(action, resource));

        return res.status(403).json({ message: "Access denied" });
      }
    } else if (!ability.can(action, subject, conditions)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { auth, authorize };
