const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var engineSchema = new Schema({
  Added_User: String,
  // {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  Console: String,
  Engine_Mode: String,
  Server_Serial_Number: String,
  Authorization_Token: String,
  Reboot_Frequency: Number,
  Reboot_Time: Number,
  Server_IP: String,
  Server_Port: Number,
  Server_Licence: String,
  Name: String,
  Muxes: String,
  Server_Auto_Expire: Number,
  Note: String
});

mongoose.model("Engine", engineSchema);