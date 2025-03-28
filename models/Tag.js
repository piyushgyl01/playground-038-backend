const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const tagSchema = new mongoose.Schema({
  tagName: {
    type: String,
    required: true,
    unique: true,
  },
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pg38Article",
    },
  ],
});

tagSchema.plugin(uniqueValidator);

module.exports = mongoose.model("pg38Tag", tagSchema);
