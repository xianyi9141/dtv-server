var router = require("express").Router();
var mongoose = require("mongoose");
var ShareChannel = mongoose.model("ShareChannel");
var util = require("../lib/util");

router.get("/", (req, res, next) => {
    ShareChannel.find({})
        // .populate('Added_User')
        // .populate('Engine')
        .then((datasets) => {
            return util.responseHandler(res, true, "Success", datasets);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.get("/:userid", (req, res, next) => {
    const userid = req.params.userid;
    ShareChannel.find({
            Added_User: userid
        })
        .populate('Engine')
        .then((engines) => {
            return util.responseHandler(res, true, "Success", engines);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.put("/", (req, res, next) => {
    console.log('channel add ', req.body)
    var newEngine = new ShareChannel(req.body);
    newEngine
        .save()
        .then(() => {
            return util.responseHandler(res, true, "Succesfully create new Channel", null);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.post("/", (req, res, next) => {
    if (!req.body._id) return util.responseHandler(res, false, "Error: require _id", null);
    ShareChannel.findByIdAndUpdate(req.body._id, {
        $set: req.body
    }, {
        new: false
    }, function (err, updatedChannel) {
        if (err) return util.responseHandler(res, false, "Error", err);
        return util.responseHandler(res, true, 'successfully updated channel', updatedChannel);
    });
});

router.delete("/", (req, res, next) => {
    var engineID = req.body._id;
    ShareChannel.deleteOne({
            _id: engineID
        })
        .exec()
        .then(result => {
            return util.responseHandler(res, true, "Success", result);
        })
        .catch(error => {
            return util.responseHandler(res, false, "Fail", error);
        });
});

module.exports = router;