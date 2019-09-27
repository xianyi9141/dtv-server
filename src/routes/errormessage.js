var router = require("express").Router();
var mongoose = require("mongoose");

var config = require('../../config');
var util = require("../lib/util");

var Log = mongoose.model("Log");

router.post("/insert", (req, res, next) => {
    console.log(req.body.errormessage);
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var newErrorMessage = new Log(req.body.errormessage);
    newErrorMessage.detail = `ip: ${ip}`;
    newErrorMessage.time = new Date();
    newErrorMessage.save().then(() => {
        res.json({
            success: true
        });
    });
});
module.exports = router;