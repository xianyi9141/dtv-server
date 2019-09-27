var router = require("express").Router();
var mongoose = require("mongoose");
var Device = mongoose.model("Device");
var Mux = mongoose.model("Mux");
var MuxerUtil = require('../lib/muxer-util');
var util = require("../lib/util");
var config = require('../../config');
router.get("/", (req, res, next) => {
    Device.find({})
        .populate('Added_User')
        .then((engines) => {
            return util.responseHandler(res, true, "Success", engines);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.get("/:userid", (req, res, next) => {
    const userid = req.params.userid;
    Device.find({
        Added_User: userid
    })
        .populate('Added_User')
        .then((engines) => {
            return util.responseHandler(res, true, "Success", engines);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.get("/play/:id", (req, res, next) => {
    const id = req.params.id;
    Device.findByIdAndUpdate(id,
        { $set: { status: 1 } },
        { new: true })
        .then((device) => {
            return util.responseHandler(res, true, "Success", device);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.get("/stop/:id", (req, res, next) => {
    const id = req.params.id;
    Device.findByIdAndUpdate(id,
        { $set: { status: 0 } },
        { new: true })
        .then((device) => {
            return util.responseHandler(res, true, "Success", device);
        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.post("/get-config", (req, res, next) => {
    var Serial_Number = req.body.Serial_Number;
    console.log(`'${Serial_Number}'`);
    if (Serial_Number == null) return util.responseHandler(res, false, "Serial_Number == null", null);
    Serial_Number = Serial_Number.toLocaleLowerCase();
    Device.findOne({
        Serial_Number: Serial_Number
    })
        .then((device) => {
            if (device == null) return util.responseHandler(res, false, "device == 0", null);
            if (device.status != 1) return util.responseHandler(res, false, "device.status != 1", null);

            Mux.findOne({ status: 1 })
                .populate({
                    path: 'channels.channel',
                    model: 'Channel'
                })
                .then(muxer => {
                    var totalData = MuxerUtil.getMuxerConfig(muxer);
                    if (totalData == null || totalData.muxes == null || totalData.muxes.length == 0) {
                        return util.responseHandler(res, false, "channel == 0", null);
                    }
                    totalData.muxes[0].device = "/dev/dvbmod0";
                    totalData.muxes[0].socket_server = config.socket_url;
                    totalData.muxes[0].socket_port = 8080;

                    totalData.muxes[0].frequency_khz = device.Frequency;
                    totalData.common.transmission_mode = device.Tx_Mode;
                    
                    totalData.common.gain = device.gain;
                    return util.responseHandler(res, true, "Success", totalData);
                })
                .catch(error => {
                    return util.responseHandler(res, false, "Error", error);
                })

        })
        .catch(err => {
            return util.responseHandler(res, false, "Error", err);
        });
});

router.put("/", (req, res, next) => {
    var newEngine = new Device(req.body);
    newEngine
        .save()
        .then(() => {
            return util.responseHandler(res, true, "Succesfully create new device", newEngine);
        })
        .catch(next);
});

var notify_to_raspberry = function (mac) {
    try {
        if (global.socket_io == null) {
            console.log('global.socket_io == null')
            return;
        }

        global.socket_io.emit('muxer-restarted', mac);
        util.Logger.LOGD('SOCKET: brodcast [ muxer-restarted ]');
    } catch (error) {
        console.log(error)
    }
};

router.post("/", (req, res, next) => {
    if (!req.body._id) return util.responseHandler(res, false, "Error: require _id", null);
    Device.findByIdAndUpdate(req.body._id,
        { $set: req.body },
        { new: false },
        function (err, updatedEngine) {
            if (err) return util.responseHandler(res, false, "Error", err);
            notify_to_raspberry(req.body.Serial_Number);
            return util.responseHandler(res, true, 'Successfully updated device', updatedEngine);
        });
});

router.delete("/:_id", (req, res, next) => {
    var engineID = req.params._id;
    Device.deleteOne({
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