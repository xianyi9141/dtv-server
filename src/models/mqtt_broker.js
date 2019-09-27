const mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var brokerSchema = new Schema({
    outgoing: Number,
    incomming: Number
}, {
    timestamps: true
});


mongoose.model("Broker", brokerSchema);