const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var configSchema = new Schema({
    region: String,
    language: String,
    newsletter: Boolean,
    units: String,
    subscription: Boolean,
    upload_freq: Number,
    polling_freq: Number,
    login_everytime: Boolean,
    af_notification: Boolean,
    email_notification: Boolean,
    share_notification: Boolean
});
mongoose.model("Config", configSchema);