const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var shareLogSchema = new Schema({
  Owner: String,
  // {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  Username: String,
  Channel: [String],
  Count: Number,
  Log: String
});

mongoose.model("ShareLog", shareLogSchema);