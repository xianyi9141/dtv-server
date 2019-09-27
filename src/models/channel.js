const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var channelSchema = new Schema({
  Added_User: String,
  // {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },
  Name: String,
  label: String,
  Engine: {
    type: Schema.Types.ObjectId,
    ref: "Engine",
  },
  Live_Stream_Source: String,
  Share: [String],
  // [{
  //   type: Schema.Types.ObjectId,
  //   ref: "Share",
  // }],
  Video_Ratio: String,
  Video_Size: String,
  Main_Video_Bitrate: Number,
  Adaptive_Video_Bitrate: Number,
  Video_Mode: String,
  Video_Encoding: String,
  Background_Image: String,
  Banner_Duration: Number,
  Banner_Interval: Number,
  Banner_Position: String,
  Banner_Source: String,
  RTMP_input: String,
  Video_Player: String,
  Note: String,
  width: Number,
  height: Number,
  isHD: Boolean,
  isAudio: Boolean
});

mongoose.model("Channel", channelSchema);