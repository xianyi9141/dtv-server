var mongoose = require("mongoose");
var Gateway = mongoose.model("Gateway");

var express = require('express');
var router = express.Router();

router.use('/engine', require('./engine'));
router.use('/channel', require('./channel'));
router.use('/share-channel', require('./share-channel'));
router.use('/mux', require('./mux'));
router.use('/device', require('./device'));
router.use('/log', require('./log'));
router.use('/share', require('./share'));
router.use('/sharelog', require('./share-log'));

router.use('/gateways', require('./gateways'));
router.use('/iot', require('./iot'));
router.use('/errormessage', require('./errormessage'));
router.use('/storage', require('./storage'));
router.use('/transfer', require('./transfer'));
router.use('/iptv', require('./iptv'));

router.get('/check', (req, res) => {
    console.log('Called --');
    res.json({
        success: true
    });
});

module.exports = router;