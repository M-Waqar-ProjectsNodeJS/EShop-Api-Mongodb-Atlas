const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const userList = await User.find().select("name email phone isAdmin");
    res.status(200).json(userList);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (user) res.status(200).json(user);
    else res.status(404).json("user with given id not found");
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

router.get("/get/count", async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({ userCount });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.body.id);
    if (user) {
      await user.delete();
      res.status(404).json({
        message: "User deleted successfully",
      });
    } else {
      res.status(404).json({
        message: "User with id not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

// Admin User Creation
router.post("/", async (req, res, next) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 15),
      city: req.body.city,
      country: req.body.country,
      phone: req.body.phone,
      isAdmin: true,
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
// Non Admin User Registration
router.post("/register", async (req, res, next) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 15),
      city: req.body.city,
      country: req.body.country,
      phone: req.body.phone,
      isAdmin: false,
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({ token });
    } else {
      res.status(200).json({
        message: "invalid user name or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

module.exports = router;
