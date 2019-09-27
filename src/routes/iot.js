var router = require("express").Router();
var config = require("../../config");


var CONFIG = require('../../config');

router.post("/direct-method-socket", (req, res) => {
  // console.log(req.body);

  const deviceId = req.body.deviceId;
  const methodName = req.body.methodName;
  const data = JSON.stringify(req.body.data);

  if (global.SocketIOClients == null) {
    return res.json({
      success: false,
      message: "global.SocketIOClients == null" + methodName,
    });
  }

  var socketIOClient = global.SocketIOClients[deviceId];
  if (socketIOClient == null) {
    return res.json({
      success: false,
      message: `global.SocketIOClients[${deviceId}] == null, ` + methodName,
    });
  }
  var isSent = false;
  var callback = function (data) {
    console.log('------------------------------', new Date().getTime())
    console.log(data);
    console.log(JSON.stringify(data, null, 2));
    if (deviceId != data.emitter) {
      return;
    }

    socketIOClient.removeListener(methodName, callback);
    isSent = true;
    return res.json({
      success: true,
      result: {
        payload: data
      }
    });
  };
  socketIOClient.on(methodName, callback);

  socketIOClient.emit(methodName, data);
  // socketIOClient.broadcast.emit(methodName, data);

  setTimeout(function () {
    if (!isSent) {
      socketIOClient.removeListener(methodName, callback);

      return res.json({
        success: false,
        message: `Failed to invoke method '${methodName}'`
      });
    }
  }, 15000);

});
var md5File = require('md5-file');
var fs = require('fs');
var dist_path = './public/firmware/rpi-server-dist.zip';
var rpi_package_path = '../../public/firmware/package.json';
// return gateway firmware version
router.get("/firmware-version", (req, res) => {

  if (fs.existsSync(dist_path)) {
    const hash = md5File.sync(dist_path);
    var RPI_GATEWAY_VERSION = require(rpi_package_path).version;
    return res.json({
      RPI_GATEWAY_VERSION: RPI_GATEWAY_VERSION,
      checksum: hash
    });
  } else {
    return res.json({
      RPI_GATEWAY_VERSION: '0.0',
      checksum: '--cannot find--'
    });
  }

});

// Download gateway firmware
router.get("/firmware-download", (req, res) => {
  res.download(dist_path);
});

var bootloader_path = './public/firmware.uploader/rpi-updater.zip';
var bootloader_package_path = '../../public/firmware.uploader/package.json';

router.get("/bootloader-version", (req, res) => {

  if (fs.existsSync(bootloader_path)) {
    const hash = md5File.sync(bootloader_path);
    var BOOTLOADER_VERSION = require(bootloader_package_path).version;
    return res.json({
      BOOTLOADER_VERSION: BOOTLOADER_VERSION,
      checksum: hash
    });
  } else {
    return res.json({
      BOOTLOADER_VERSION: '0.0',
      checksum: '--cannot find--'
    });
  }
});

// Download gateway bootloader(updater)
router.get("/bootloader-download", (req, res) => {
  console.log('================ bootloader-download ===================')
  res.download(bootloader_path);
});


module.exports = router;