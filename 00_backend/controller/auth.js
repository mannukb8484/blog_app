//s12:creater
const User = require("../model/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const { validationResult } = require("express-validator");
const { loginSchema, signUpSchema } = require("../util/validation.js");

exports.signUp = async (req, res, next) => {
  try {
    const { error, value } = signUpSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const err = new Error("Validation failed");
      err.statusCode = 422;
      err.data = error.details.map((d) => ({ message: d.message })); //errors from validationResult(req); has method .array()
      throw err;
    }
    const { name, email, password } = value;
    // validate if email already exist
    const userDoc = await User.findOne({ email });
    if (userDoc) {
      const err = new Error("invalid email or password"); //
      err.statusCode = 422;
      throw err;
    }
    // all validation passed, then only
    // s13:
    const hashedpw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedpw,
      name: name,
    });
    const result = await user.save();
    res
      .status(201)
      .json({ message: "user created successfully", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//s14:
exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const err = new Error("Validation failed");
      //set the property of this new err from the error object
      //joi gave us and throw our created error carrying info from joi
      err.statusCode = 422;
      err.data = error.details.map((d) => ({ message: d.message }));
      throw err;
    }
    // now no optional chainig needed before extracting
    // email and password as validated the body
    // aq validation logic at the defination of the routes
    const { email, password } = value;
    // let loadedUser; //can remove coz in async await found_user globally available
    const found_user = await User.findOne({ email: email });
    console.log(found_user);
    if (!found_user) {
      // res.status(404).json({message:'no user with this email is found'});
      const error = new Error("no user with this email is found");
      error.statusCode = 401; //auth failed can do 404
      throw error;
    }
    const isEqual = await bcrypt.compare(password, found_user.password); // T/F

    if (!isEqual) {
      const error = new Error("wrong password");
      error.statusCode = 401; //auth failed can do 404
      throw error;
    }
    //JWT:loaded during login for auth middleware to verify
    const token = jwt.sign(
      //funcn to generate
      {
        email: found_user.email,
        userId: found_user._id.toString(),
      },
      // config:
      process.env.SECRET,
      { expiresIn: process.env.EXPIARY }, //.env for multile places uses
    );
    res.status(200).json({ token: token, userId: found_user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
