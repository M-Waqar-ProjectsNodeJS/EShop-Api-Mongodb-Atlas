const express = require("express");
const Product = require("../models/product");
const Category = require("../models/category");
const multer = require("multer");
const path = require("path");
const router = express.Router();
// File types which is allowed to upload
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
// Disk Storage to upload the files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type in the request");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const name = path.parse(file.originalname).name;
    const fileName = name.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

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
router.post("/", uploadOptions.single("image"), async (req, res, next) => {
  try {
    let category = await Category.findById(req.body.category);
    if (!category)
      return res.status(400).json({ message: "invalid category id" });

    const file = req.file;
    if (!file)
      return res.status(400).json({ message: "No image in the request" });

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
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
      res.status(404).json({ message: "Product with given id not found" });
    }
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

router.put(
  "/image-gallary/:id",
  uploadOptions.array("images", 10),
  async (req, res, next) => {
    try {
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      const files = req.files;
      let imagesPaths = [];

      if (files) {
        files.map((file) => {
          imagesPaths.push(`${basePath}${file.filename}`);
        });
      }

      let product = await Product.findById(req.params.id);
      if (product) {
        product.images = imagesPaths;
        await product.save();
        res.status(201).json(product);
      } else {
        res.status(404).json({ message: "Product with given id not found" });
      }
    } catch (error) {
      res.status(500).json({
        error: error,
      });
    }
  }
);

module.exports = router;
