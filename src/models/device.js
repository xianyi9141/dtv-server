const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var deviceSchema = new Schema({
  Added_User: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  },
  Label: String,
  Serial_Number: String,
  // {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  Log: String,
  Model: String,
  Frequency: Number,
  Tx_Mode: String,
  gain: Number,
  status: Number
});

mongoose.model("Device", deviceSchema);