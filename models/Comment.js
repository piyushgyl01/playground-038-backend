const mongoose = require("mongoose");
const User = require("./User");

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pg38User",
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pg38Article",
    },
  },
  {
    timestamps: true,
  }
);

// commentSchema.methods.toCommentResponse = async function (user) {
//   const authorObj = await User.findById(this.author).exec();
//   return {
//     id: this._id,
//     body: this.body,
//     createdAt: this.createdAt,
//     updatedAt: this.updatedAt,
//     author: authorObj.toProfileJSON(user),
//   };
// };

module.exports = mongoose.model("pg38Comment", commentSchema);
