const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var channelSchema = new Schema({
  Added_User: String,
  // {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  username: String,
  Channel: String
});

mongoose.model("ShareChannel", channelSchema);