const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");

exports.createFeedback = asyncErrorHandle(async (req, res) => {
  const {name, email, message, restaurantId} = req.body;
  console.log(req.body);
  if (!message || message.trim() === "") {
    return res.status(400).json({error: "Санал хүсэлт хоосон байж болохгүй"});
  }
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: parseInt(restaurantId),
    },
  });

  if (!restaurant) {
    return res.status(404).json({error: "Ресторан олдсонгүй"});
  }

  const feedback = await prisma.feedback.create({
    data: {
      name,
      email,
      message,
      restaurantId: parseInt(restaurantId),
      status: "PENDING",
    },
  });

  res.status(201).json(feedback);
});

exports.getRestaurantFeedback = asyncErrorHandle(async (req, res) => {
  const {restaurantId} = req.params;
  const {status} = req.query;

  if (req.user.role === "RESTAURANT_OWNER") {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: parseInt(restaurantId),
      },
    });

    if (!restaurant) {
      return res
        .status(403)
        .json({error: "Энэ рестораны санал хүсэлтийг харах эрхгүй байна"});
    }
  }

  const whereClause = {
    restaurantId: parseInt(restaurantId),
  };

  if (req.user.role !== "RESTAURANT_OWNER") {
    whereClause.status = "APPROVED";
  } else if (status) {
    whereClause.status = status.toUpperCase();
  }

  console.log("Where Clause:", whereClause);

  const feedback = await prisma.feedback.findMany({
    where: whereClause,
    include: {
      restaurant: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("Found Feedback:", feedback);

  res.json(feedback);
});

exports.getOwnerFeedback = asyncErrorHandle(async (req, res) => {
  if (req.user.role !== "RESTAURANT_OWNER") {
    return res
      .status(403)
      .json({error: "Only restaurant owners can access this endpoint"});
  }

  const {status} = req.query;

  const restaurants = await prisma.restaurant.findMany({
    where: {
      userId: req.user.id,
    },
    select: {
      id: true,
    },
  });

  const restaurantIds = restaurants.map((restaurant) => restaurant.id);

  const whereClause = {
    restaurantId: {
      in: restaurantIds,
    },
  };

  if (status) {
    whereClause.status = status.toUpperCase();
  }

  const feedback = await prisma.feedback.findMany({
    where: whereClause,
    include: {
      restaurant: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(feedback);
});

exports.updateFeedbackStatus = asyncErrorHandle(async (req, res) => {
  const {id} = req.params;
  const {status} = req.body;

  if (req.user.role === "RESTAURANT_OWNER") {
    const feedback = await prisma.feedback.findUnique({
      where: {id: parseInt(id)},
      include: {restaurant: true},
    });

    if (!feedback || feedback.restaurant.userId !== req.user.id) {
      return res
        .status(403)
        .json({error: "Not authorized to update this feedback"});
    }
  }

  const updatedFeedback = await prisma.feedback.update({
    where: {
      id: parseInt(id),
    },
    data: {
      status,
    },
  });

  res.json(updatedFeedback);
});

exports.deleteFeedback = asyncErrorHandle(async (req, res) => {
  const {id} = req.params;

  if (req.user.role !== "ADMIN") {
    const feedback = await prisma.feedback.findUnique({
      where: {id: parseInt(id)},
      include: {restaurant: true},
    });

    if (!feedback || feedback.restaurant.userId !== req.user.id) {
      return res
        .status(403)
        .json({error: "Not authorized to delete this feedback"});
    }
  }

  await prisma.feedback.delete({
    where: {
      id: parseInt(id),
    },
  });

  res.json({message: "Feedback deleted successfully"});
});
