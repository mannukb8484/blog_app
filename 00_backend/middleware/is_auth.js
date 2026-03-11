const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodetoken;
  try {
    // if verify success, it returns the
    // the data we hid inside the token like email and userId
    decodetoken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    err.statusCode = 500; //server error
    throw err;
  }
  if (!decodetoken) {
    const error = new Error("not authenticated.");
    error.statusCode = 401; //unauthorize client error
    throw error;
  }
  //loaded it at login or signup+login...once per expire_in unit time
  // console.log("MiddleWare Decoded:", decodetoken.userId);
  req.userId = decodetoken.userId;
  next(); //to move control to controller
};
