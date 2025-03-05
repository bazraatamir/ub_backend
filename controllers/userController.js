const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const asyncErrorHandle = require("../middleware/asyncHandler");

exports.register = asyncErrorHandle(async (req, res) => {
    const { username, email, password, role } = req.body;
    const existingUser = await prisma.user.findFirst({
      where: {OR: [{ email }, { username }],},
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {username,email,password: hashedPassword,role: role || "USER",},
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {id: user.id,username: user.username,email: user.email,role: user.role,},
    });
});

exports.login = asyncErrorHandle(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      message: "Login successful",
      token,
      user: {id: user.id,username: user.username,email: user.email,role: user.role,},
    });
});

exports.getProfile = asyncErrorHandle(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {restaurant: true,},
    });
    res.json(user);
});

exports.updateProfile = asyncErrorHandle(async (req, res) => {
    const { username, email } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {username,email,},
    });

    res.json({
      message: "Profile updated successfully",
      user,
    });
});
