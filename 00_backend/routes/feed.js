const express = require("express");
const router = express.Router();
// s3:
//s1:require the feed controller
const feedController = require("../controller/feed.js");
// s16...add to all routes
const isAuth = require("../middleware/is_auth.js");
//s1:route 1:display all posts GET: feed/posts
router.get("/posts", isAuth, feedController.getPosts);
//s1:route 2:new post GET: feed/posts/:id
router.post("/post", isAuth, feedController.createPost);
//s6:single_post
router.get("/post/:postId", isAuth, feedController.getPost);
// s8: edit post
router.put("/post/:postId", isAuth, feedController.updatePost);
// s9: delete post
router.delete("/post/:postId", isAuth, feedController.deletePost);
//s1:export it:
module.exports = router;
