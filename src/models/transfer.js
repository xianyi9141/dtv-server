const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var transferSchema = new Schema({
  Seller: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  },
  Buyer: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  },
  Credit: String,
  Log: String,
});

mongoose.model("Transfer", transferSchema);