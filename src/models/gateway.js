const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var gatewaySchema = new Schema({
  name: String,
  deviceId: String,
  deviceKey: String,
  index: Number,
  isApprove: Boolean,
  firmware: String,
  bootloader: String,
  isEmulator: Boolean,
  devices: [{
    type: Schema.Types.ObjectId,
    ref: "Device",
  }, ],
}, {
  timestamps: true
});

gatewaySchema.statics.findByDeviceID = (deviceId) => {
  return mongoose.model('Gateway').findOne({
    deviceId: deviceId
  })
}

mongoose.model("Gateway", gatewaySchema);