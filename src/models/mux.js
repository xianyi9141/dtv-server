const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var muxSchema = new Schema({
  Added_User: String,
  Label: String,
  Console: String,
  Share: [String],
  Transcoding: String,
  Mode: String,
  ONID: Number,
  TSID: Number,
  NID: Number,
  Bandwidth: Number,
  Guard_Interval: String,
  Code_Rate: String,
  Constellation: String,

  Engine_Serial_Number: String,
  Zapelin_Micro_Serial: String,
  channels: [{
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
    },
    Label: String,
    SID: String,
    LCN: String
  }],
  Buffer_Time: Number,
  RTP_host: String,
  RTP_port: String,
  RTP_CBR: String,
  HLS_Token: String,
  capacity:Number,

  status: Number
});

mongoose.model("Mux", muxSchema);