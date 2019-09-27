var router = require("express").Router();
var mongoose = require("mongoose");
var Mux = mongoose.model("Mux");
var util = require("../lib/util");

router.get("/", (req, res, next) => {
    Mux.find({})
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
    const userid = req.params.userid
    Mux.find({
        Added_User: userid
    })
        .populate({
            path: 'channels.channel',
            model: 'Channel'
        })
        .then((engines) => {
            return util.responseHandler(res, true, "Success", engines);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

var MuxerUtil = require('../lib/muxer-util');

var run_Muxer = async function (muxer, res) {
    try {
        var success = MuxerUtil.runMuxer(muxer);
        return util.responseHandler(res, true, "Success", success);
    } catch (error) {
        console.log(error)
        util.responseHandler(res, false, "Error occur", error);
    }
};

router.get("/run/:muxerId", (req, res, next) => {

    const muxerId = req.params.muxerId;
    console.log('muxerId', muxerId)
    Mux.findById(muxerId)
        .populate({
            path: 'channels.channel',
            model: 'Channel'
        })
        .then((muxer) => {
            // console.log(muxer)
            run_Muxer(muxer, res)
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.get("/stop/:muxerId", (req, res, next) => {

    const muxerId = req.params.muxerId;
    console.log('muxerId', muxerId)
    Mux.findById(muxerId)
        .then((muxer) => {
            muxer.status = 0;
            muxer.save().then((updatedMuxer) => {
                util.responseHandler(res, true, "Successfully updated", updatedMuxer);
            })
                .catch(error => {
                    console.log(error);
                    util.responseHandler(res, false, "Error occur", error);
                })
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.put("/", (req, res, next) => {
    console.log('channel add ', req.body)
    var newEngine = new Mux(req.body);
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
    Mux.findByIdAndUpdate(req.body._id, {
        $set: req.body
    }, {
            new: false
        }, function (err, updatedChannel) {
            if (err) return util.responseHandler(res, false, "Error", err);
            return util.responseHandler(res, true, 'successfully updated channel', updatedChannel);
        });
});

router.post("/command", (req, res) => {
    console.log('command ', req.body.command)
    try {
        if (global.muxer_thread) global.muxer_thread.stdin.write(req.body.command);
        return util.responseHandler(res, true, "Succesfully send command to muxer", null);
    } catch (error) {
        return util.responseHandler(res, false, "Error occur send command to muxer", error);
    }

});

router.delete("/:muxerId", (req, res, next) => {
    var muxerId = req.params.muxerId;
    Mux.deleteOne({
        _id: muxerId
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