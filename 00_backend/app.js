// set-up of the mongo to compass and database
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");

const file_upload = require("./middleware/file_upload.js");
const feedRoutes = require("./routes/feed.js");
const authRoutes = require("./routes/auth.js");
const connectDb = require("./config/db.js").connectDb;
const app = express();

//security: crossOriginResourcePolicy: false, for image to be allowed..json allowed but not image...
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
// s1:
connectDb();

const server = app.listen(8080);
// s19:initialized in app.js , so io object we can use now
const io = require("./socket.js").init(server);
io.on("connection", (socket) => {
  console.log("start", socket.id);
});
//s1:require routes from the feed
// s1:any route with prefix '/feed' will get handled by the this route handler we pass here
app.use("/feed", feedRoutes);
//s11
app.use("/auth", authRoutes);
// s6:

//s5:
app.use((error, _, res) => {
  console.log(error);
  const statusCode = error.statusCode || 500;
  const message = error.message || "an unexpected error occured";
  const data = error.data;
  res.status(statusCode).json({ message: message, error: data });
});
