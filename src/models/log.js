const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var logSchema = new Schema({
  from: String,
  Owner: String,
  Time: Number,
  Name: String,
  Value: String,
  Tag: String
});

mongoose.model("Log", logSchema);