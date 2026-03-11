// set-up of the mongo to compass and database
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
// const multer = require("multer");
const helmet = require("helmet");
const file_upload = require("./middleware/file_upload.js");
const cors = require("cors");
const MONGODB_URL = process.env.MONGODB_URL;
const app = express();

//security: crossOriginResourcePolicy: false, for image to be allowed..json good but image...
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(cors());

// s1:body parser setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// s5:absolute path for static serving
app.use("/images", express.static(path.join(__dirname, "images")));
// s7:
app.use(file_upload); //executed version
// s1
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to Atlas Cloud!");
  })
  .catch((err) => {
    console.log("Connection failed!", err);
    console.error(err);
  });

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
//s1:require routes from the feed
const feedRoutes = require("./routes/feed.js");
// s11
const authRoutes = require("./routes/auth.js");

// s1:any route with prefix '/feed' will get handled by the this route handler we pass here
app.use("/feed", feedRoutes);
//s11
app.use("/auth", authRoutes);
// s6:

//s5:
app.use((error, req, res, next) => {
  console.log(error);
  const statusCode = error.statusCode || 500;
  const message = error.message || "an unexpected error occured";
  const data = error.data;
  res.status(statusCode).json({ message: message, error: data });
});