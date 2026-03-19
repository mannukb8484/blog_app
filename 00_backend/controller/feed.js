// s8:
const fs = require("fs");
const path = require("path");
// s4
const Post = require("../model/post.js");
// s17
const User = require("../model/user.js");
// const { validationResult } = require("express-validator");
const { createPostSchema, updatePostSchema } = require("../util/validation.js");
// s19:
const io = require("../socket.js");
// s1:getPosts
exports.getPosts = async (req, res, next) => {
  // s10
  try {
    const currentPage = req.query.page || 1; //start at page 1, if undef
    const perPage = 2; //front end has same val , tweak with precaution
    let totalItems; //const must initialize, so let
    // const count = await Post.find().countDocuments();
    const count = await Post.countDocuments();
    totalItems = count;
    //find but skip initialpage's items and
    // after skip only fetch next "perPage" items
    // we want for next page
    const posts = await Post.find()
      .populate("creator") //s19
      .sort({ createdAt: -1 }) //latest post come 1st
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "post fectched",
      posts: posts,
      totalItems: totalItems, //frontend needs it
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err); //for async: throw wont work
  }
};

//createPost
exports.createPost = async (req, res, next) => {
  try {
    // s3: not in asysnc , so simply throwing will take it to next error handling middleware
    const { error, value } = createPostSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const err = new Error("validation failed , entered data is incorrect");
      err.statusCode = 422;
      err.data = error.details.map((d) => ({ message: d.message }));
      throw err; //exit function and goto err handling m_ware, no need next(error) for sync code
    }
    //s7:
    if (!req.file) {
      const imageError = new Error("no image uplaoded");
      imageError.statusCode = 422; //validation error
      throw imageError;
    }
    const imageUrl = req.file.path;
    const { title, content } = value;
    // s17
    let creator;
    // s4: create the post using the schema: arg:js-obj
    const post = new Post({
      title: title,
      content: content,
      // creator: {
      //   name: "mannu",
      // },
      // s17: two change , real user creating and remove object
      // as scema now expect the Schema.Types.ObjectId,
      // type of Schema.Types.ObjectId && req.userId not same
      // but mongoose caste them.
      creator: req.userId,
      imageUrl: imageUrl,
    });
    await post.save();
    // s17: before after saving the post, direct send the respponse, but now
    // must connect the post to user, & user to post
    const user = await User.findById(req.userId);
    creator = user;
    user.posts.push(post); //post id adding to the user,by mongoose
    await user.save();
    //s19:just after save and before sending response,inform all other user using io
    io.getIO().emit("posts", {
      action: "create",
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    });
    res.status(201).json({
      message: "post successfully created",
      post: post, //post we created and stored in the content
      creator: { _id: creator._id, name: creator.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err); //for async: throw wont work
  }
};

//s6: getPost not getPostS
exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId; // postId: must be same as in routes/feed.js
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("could not find post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "post fectched", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//s8
exports.updatePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const { error, value } = updatePostSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const err = new Error("validation failed , entered data is incorrect");
      err.statusCode = 422;
      err.data = error.details.map((d) => ({ message: d.message }));
      throw err; //exit function and goto err handling m_ware, no need next(error) for sync code
    }
    //above: error check before trying to extracting any field
    let imageUrl = req.body.image; //sent from the form like form data with name image
    // const { title, content } = req.body;
    const { title, content } = value; //???why
    if (req.file) {
      imageUrl = req.file.path;
    }
    if (!imageUrl) {
      const error = new Error("no file PICKED");
      error.statusCode = 422; //wrong data format/valdation error
      throw error;
    }
    // s20: populate added so we can send whole updated post via socket.io
    const post = await Post.findById(postId).populate();
    if (!post) {
      const error = new Error("could not find post");
      error.statusCode = 404;
      throw error;
    }
    // s18: authorization, compare the user_id from request body sent by isauth and from database
    // entry of current_user
    // if (post.creator.toString() !== req.userId) {
    //bcoz of populate it is now full post not only _id
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("authorisation failed");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      await clearImage(post.imageUrl);
    }
    // all error checked: now we can update after knowing all data valid
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const result = await post.save();
    // s20:
    io.getIO().emit("posts", { action: "update", post: result });
    res.status(200).json({ message: "post updated", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = async (filePath) => {
  // code run in controller, so must go up one folder to go to the root folder
  const fullPath = path.join(__dirname, "..", filePath);
  try {
    await fs.promises.unlink(fullPath);
  } catch (err) {
    console.log("failed to delete image", err);
  }
};

// s9:
exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    // not direct findByIdAndDelete: user varify + diff. layer of error handling
    const post = await Post.findById(postId);
    //check loggedin user
    if (!post) {
      const error = new Error("could not find post");
      error.statusCode = 404;
      throw error;
    }
    // s18: authorization, compare the user_id from request body sent by isauth and from database
    // entry of current_user
    if (post.creator.toString() !== req.userId) {
      const error = new Error("authorisation failed");
      error.statusCode = 403;
      throw error;
    }
    await Post.findByIdAndDelete(postId);
    await clearImage(post.imageUrl);
    //s19
    // although post is gone, we still have
    // user_Id that auth sent in req.body
    const user = await User.findById(req.userId);
    //s19:we found the user who deleted his post
    //now we update reference of his post in DB using mongoose
    user.posts.pull(postId);
    await user.save();
    io.getIO().emit("posts", { action: "delete", post: postId });
    res.status(200).json({ message: "deletion successful" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
