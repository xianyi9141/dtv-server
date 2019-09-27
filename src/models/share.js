const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var shareSchema = new Schema({
  Username: String,
  // {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  Channel: [String]
});

mongoose.model("Share", shareSchema);