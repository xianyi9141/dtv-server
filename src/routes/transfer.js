var router = require("express").Router();
var mongoose = require("mongoose");
var Transfer = mongoose.model("Transfer");
var util = require("../lib/util");

router.get("/", (req, res, next) => {
    Transfer.find({})
        .populate('Seller')
        .populate('Buyer')
        .then((datasets) => {
            return util.responseHandler(res, true, "Success", datasets);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.get("/:userid", (req, res, next) => {
    const userid = req.params.userid;
    Transfer.find({
            Seller: userid
        })
        .populate('Seller')
        .populate('Buyer')
        .then((engines) => {
            return util.responseHandler(res, true, "Success", engines);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.put("/", (req, res, next) => {
    var newEngine = new Transfer(req.body);
    newEngine
        .save()
        .then(() => {
            return util.responseHandler(res, true, "Succesfully create new Log", newEngine);
        })
        .catch(next);
});

router.post("/", (req, res, next) => {
    if (!req.body._id) return util.responseHandler(res, false, "Error: require _id", null);
    Transfer.findByIdAndUpdate(req.body._id, {
        $set: req.body
    }, {
        new: false
    }, function (err, updatedLog) {
        if (err) return util.responseHandler(res, false, "Error", err);
        return util.responseHandler(res, true, 'successfully updated log', updatedLog);
    });
});

router.delete("/", (req, res, next) => {
    var logID = req.body._id;
    Transfer.deleteOne({
            _id: logID
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