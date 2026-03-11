// s11:creator
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    //
    default: "i am new",
  },

  // fix:::   ********array of post_id*********
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});
// export a user model that uses the "userSchema"
module.exports = mongoose.model("user", userSchema);
