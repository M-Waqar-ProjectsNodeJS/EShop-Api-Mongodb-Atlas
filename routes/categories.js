const express = require("express");
const Category = require("../models/category");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let categoryList = await Category.find();
    res.status(200).json(categoryList);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({
        message: "category with given id not found.",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
router.post("/", async (req, res, next) => {
  try {
    let category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
router.delete("/", async (req, res, next) => {
  try {
    let result = await Category.findByIdAndRemove(req.body.id);
    if (result) {
      res.status(200).json({
        message: "category deleted successfully.",
      });
    } else {
      res.status(404).json({
        message: "category with given id not found.",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
router.put("/", async (req, res, next) => {
  try {
    let category = await Category.findById(req.body.id);
    if (category) {
      category.name = req.body.name;
      category.icon = req.body.icon;
      category.color = req.body.color;

      await category.save();
      res.status(200).json(category);
    } else {
      res.status(404).json({
        message: "category with given id not found.",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

module.exports = router;
