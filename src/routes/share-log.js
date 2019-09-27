var router = require("express").Router();
var mongoose = require("mongoose");
var Share = mongoose.model("Share");
var util = require("../lib/util");

router.get("/", (req, res, next) => {
    Share.find({})
        // .populate('Added_User')
        // .populate('Engine')
        .then((datasets) => {
            return util.responseHandler(res, true, "Success", datasets);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.put("/", (req, res, next) => {
    var newEngine = new Share(req.body);
    newEngine
        .save()
        .then(() => {
            return util.responseHandler(res, true, "Succesfully create new Share", newEngine);
        })
        .catch(next);
});

router.post("/", (req, res, next) => {
    if (!req.body._id) return util.responseHandler(res, false, "Error: require _id", null);
    Share.findByIdAndUpdate(req.body._id, {
        $set: req.body
    }, {
        new: false
    }, function (err, updatedShare) {
        if (err) return util.responseHandler(res, false, "Error", err);
        return util.responseHandler(res, true, 'successfully updated share', updatedShare);
    });
});

router.delete("/", (req, res, next) => {
    var shareID = req.body._id;
    Share.deleteOne({
            _id: shareID
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