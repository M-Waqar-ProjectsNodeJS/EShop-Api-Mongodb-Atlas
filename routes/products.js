const express = require("express");
const Product = require("../models/product");
const Category = require("../models/category");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.category)
      // get the params from query string
      filter = { category: req.query.category.split(",") };
    let productList = await Product.find(filter).populate("category"); // all column including id column details
    //let productList = await Product.find(); // For All Columns of collection only
    //let productList = await Product.find().select("name image"); // For selected columns with _id
    //let productList = await Product.find().select("name image -_id"); // For selected columns without _id
    res.status(200).json(productList);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id).populate("category");
    if (product) res.status(200).json(product);
    else res.status(404).json({ message: "Product with given id not found" });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
router.get("/get/count", async (req, res, next) => {
  try {
    let productsCount = await Product.countDocuments();
    res.status(200).json({ productsCount });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
router.get("/get/featured/:count", async (req, res, next) => {
  try {
    let products = await Product.find({ isFeatured: true }).limit(
      +req.params.count // + to make string to number
    );
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
router.post("/", async (req, res, next) => {
  try {
    let category = await Category.findById(req.body.category);
    if (!category)
      return res.status(400).json({ message: "invalid category id" });

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated,
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
router.delete("/", async (req, res, next) => {
  try {
    let product = await Product.findById(req.body.id);
    if (product) {
      await product.delete();
      res.status(404).json({ message: "Product deleted successfully." });
    } else {
      res.status(404).json({ message: "Product with given id not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});
router.put("/", async (req, res, next) => {
  try {
    let category = await Category.findById(req.body.category);
    if (!category)
      return res.status(400).json({ message: "invalid category id" });

    let product = await Product.findById(req.body.id);
    if (product) {
      product.name = req.body.name;
      product.description = req.body.description;
      product.richDescription = req.body.richDescription;
      product.image = req.body.image;
      product.images = req.body.images;
      product.brand = req.body.brand;
      product.price = req.body.price;
      product.category = req.body.category;
      product.countInStock = req.body.countInStock;
      product.rating = req.body.rating;
      product.numReviews = req.body.numReviews;
      product.isFeatured = req.body.isFeatured;
      product.dateCreated = req.body.dateCreated;

      await product.save();
      res.status(201).json(product);
    } else {
      return res
        .status(404)
        .json({ message: "Product with given id not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

module.exports = router;
