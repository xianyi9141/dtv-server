var router = require("express").Router();
var mongoose = require("mongoose");
var Engine = mongoose.model("Engine");
var util = require("../lib/util");

router.get("/", (req, res, next) => {
    Engine.find({})
        // .populate('Added_User')
        .then((engines) => {
            return util.responseHandler(res, true, "Success", engines);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.get("/:userid", (req, res, next) => {
    const userid = req.params.userid;
    Engine.find({Added_User:userid})
        // .populate('Added_User')
        .then((engines) => {
            return util.responseHandler(res, true, "Success", engines);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.put("/", (req, res, next) => {
    var newEngine = new Engine(req.body);
    newEngine
        .save()
        .then(() => {
            return util.responseHandler(res, true, "Succesfully create new Engine", newEngine);
        })
        .catch(next);
});

router.post("/", (req, res, next) => {
    if (!req.body._id) return util.responseHandler(res, false, "Error: require _id", null);
    Engine.findByIdAndUpdate(req.body._id, {
        $set: req.body
    }, {
        new: false
    }, function (err, updatedEngine) {
        if (err) return util.responseHandler(res, false, "Error", err);
        return util.responseHandler(res, true, 'success update engine', updatedEngine);
    });
});

router.delete("/:_id", (req, res, next) => {
    var engineID = req.params._id;
    Engine.deleteOne({
            _id: engineID
        })
        .exec()
        .then(result => {
            return util.responseHandler(res, true, "Success", result);
        })
        .catch(error => {
            return util.responseHandler(res, false, "Error occur", error);
        });
});

module.exports = router;