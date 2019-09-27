const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var accountSchema = new Schema({
  username: String,
  password: String,
  uid: String,
  Credit: String,
  First_Name: String,
  Last_Name: String,
  Company_Name: String,
  Billing: String,
  Mobile_Number: String,
  Alternative_Email: String,
  Webpage: String,
  Contact_Address: String,
  Delivery_Address: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

mongoose.model("Account", accountSchema);