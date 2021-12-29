require("dotenv/config");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const authJWT = require("./helpers/authJwt");

const categoryRoute = require("./routes/categories");
const productsRoute = require("./routes/products");
const userRoute = require("./routes/users");
const orderRoute = require("./routes/orders");

const app = express();
const apiUrl = process.env.API_URL;

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("tiny"));
//app.use(authJWT());

app.use(`${apiUrl}/category`, categoryRoute);
app.use(`${apiUrl}/product`, productsRoute);
app.use(`${apiUrl}/user`, userRoute);
app.use(`${apiUrl}/order`, orderRoute);

app.use((req, res, next) => {
  const error = new Error("Route Not Found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res.status(401).json({ message: "The user is not authorized" });
  }
  if (err.status === 400) {
    return res.status(400).json({ message: err.message });
  }
  if (err.status === 404) {
    return res.status(404).json({ message: err.message });
  }
  // default to 500 server error
  return res.status(500).json({ message: err.message });
});

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => console.log("DataBase Connected & Ready ...!"))
  .catch((error) => console.log(error));

const port = process.env.PORT || 5000;
app.listen(port, (error) => {
  if (error) console.log(error);
  else console.log(`Server is running on http://localhost:${port}`);
});
