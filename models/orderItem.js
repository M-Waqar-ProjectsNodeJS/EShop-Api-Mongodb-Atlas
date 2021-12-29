const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const orderItem = mongoose.model("orderItems", orderItemSchema);

module.exports = orderItem;
