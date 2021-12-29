const express = require("express");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const orderList = await Order.find()
      .populate("user", "name email")
      .sort({ dateOrdered: -1 });
    res.status(200).json(orderList);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          select: "name description price",
          populate: {
            path: "category",
            select: "name",
          },
        },
      });
    if (order) res.status(200).json(order);
    else res.status(404).json({ message: "order with id not found" });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const orderItems = await OrderItem.insertMany(req.body.orderItems);
    const orderitemsIds = orderItems.map((orderItem) => {
      return orderItem._id;
    });
    const order = new Order({
      orderItems: orderitemsIds,
      shippingAddress: req.body.shippingAddress,
      city: req.body.city,
      country: req.body.country,
      phone: req.body.phone,
      totalPrice: req.body.totalPrice,
      user: req.body.user,
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/", async (req, res, next) => {
  try {
    let order = await Order.findById(req.body.id);
    if (order) {
      order.status = req.body.status;
      await order.save();
      res.status(200).json(order);
    } else {
      res.status(404).json({ message: "order with id not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    let order = await Order.findById(req.body.id);
    if (order) {
      const orderItemsids = order.orderItems;
      orderItemsids.map(async (orderItemId) => {
        let item = await OrderItem.findById(orderItemId);
        console.log(item);
        await item.delete();
      });
      await order.delete();
      res.status(200).json("order deleted successfully");
    } else {
      res.status(404).json({ message: "order with id not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/get/totalsales", async (req, res, next) => {
  try {
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/get/orders-count", async (req, res, next) => {
  try {
    let totalOrders = await Order.find({ status: "PENDING" }).countDocuments();
    res.status(200).json({ totalOrders });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/get/total-sales", async (req, res, next) => {
  try {
    let sales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/get/user-orders/:id", async (req, res, next) => {
  try {
    let userOrders = await Order.find({ user: req.params.id })
      .populate("user", "name email")
      .sort({ dateOrdered: -1 });
    res.status(200).json({ userOrders });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
