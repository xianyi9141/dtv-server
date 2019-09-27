var router = require('express').Router();
var mongoose = require('mongoose');
var Gateway = mongoose.model('Gateway');
var Device = mongoose.model('Device');
var util = require('../lib/util');
var Config = require('../../config');

router.param('gateway', function (req, res, next, deviceId) {
  Gateway.findOne({
      deviceId: deviceId,
    })
    .then(function (gateway) {
      if (!gateway) {
        return res.sendStatus(404);
      }

      req.gateway = gateway;

      return next();
    })
    .catch(next);
});

// return a list of gateways
router.get('/', function (req, res, next) {
  Gateway.find()
    .sort('index')
    .populate({
      path: 'devices'
    })
    .then(function (gateways) {
      return res.json({
        gateways: gateways,
      });
    })
    .catch(next);
});

// return a list of emulator gateways
router.get('/emulators', function (req, res, next) {
  Gateway.find({
      isEmulator: true
    })
    .sort('index')
    .populate({
      path: 'devices'
    })
    .then(function (gateways) {
      return res.json({
        gateways: gateways,
      });
    })
    .catch(next);
});

var updateGatewayIndex = function (_id, index) {
  Gateway.findById(_id).then(gateway => {
    if (gateway == null) return

    if (gateway.index == index) return;

    Gateway.findByIdAndUpdate(_id, {
      $set: {
        index: index
      }
    }, function (err, gateway) {
      if (err) console.error(err);
    });

  });
}

router.post('/updateGatewaysOrder', (req, res) => {
  var gatewayOrderList = req.body;
  for (var i = 0; i < gatewayOrderList.length; i++) {
    try {
      updateGatewayIndex(gatewayOrderList[i]._id, gatewayOrderList[i].index);
    } catch (error) {
      console.error(error)
    }
  }
  return res.json({
    gateways: 'success',
  });
  // return util.responseHandler(res, true, 'success', null);
});

var updateDeviceIndex = function (_id, index) {
  Device.findById(_id).then(device => {
    if (device == null) return

    if (device.index == index) return;

    Device.findByIdAndUpdate(_id, {
      $set: {
        index: index
      }
    }, function (err, device) {
      if (err) console.error(err);
    });

  });
}

router.post('/updateDevicesOrder', (req, res) => {
  var deviceOrderList = req.body;
  for (var i = 0; i < deviceOrderList.length; i++) {
    try {
      updateDeviceIndex(deviceOrderList[i]._id, deviceOrderList[i].index);
    } catch (error) {
      console.error(error)
    }
  }
  return res.json({
    devices: 'success',
  });
  // return util.responseHandler(res, true, 'success', null);
});

// return specific gateway with deviceID
router.get('/:deviceId', (req, res) => {
  Gateway.findOne({
      deviceId: req.params.deviceId,
    })
    .populate('devices')
    .then(gateway => {
      return res.json({
        gateway: gateway,
      });
    });
});



// post gateway
router.post('/', (req, res, next) => {
  var newGateway = new Gateway(req.body.gateway);
  Gateway.findOne({
    deviceId: newGateway.deviceId,
  }).then(gateway => {
    if (gateway) {
      if (gateway.name != newGateway.name) {
        Gateway.update({
          deviceId: newGateway.deviceId
        }, {
          $set: {
            name: newGateway.name
          }
        }, function (err, gateway) {
          if (err) {
            console.log(err);
          }
          console.log('Successfully updated gateway name');
        });
      }
      if (gateway.isApprove)
        return res.json({
          message: 'Gateway already registered',
          gateway: gateway,
          isFirstRequestApprove: false
        });
      else
        return res.json({
          message: 'Gateway Register Request already sended',
          gateway: gateway,
          isFirstRequestApprove: false
        });
    }
    return newGateway
      .save()
      .then(() => {
        return res.json({
          message: 'Succesfully create request for register gateway',
          gateway: newGateway,
          isFirstRequestApprove: true,
          index: 1000
        });
      })
      .catch(next);
  });
});

// post gateway
router.post('/add-emulator', (req, res, next) => {
  var newGateway = new Gateway(req.body.gateway);
  newGateway.deviceId = newGateway.deviceId.toLowerCase();
  Gateway.findById(newGateway._id).then(gateway => {
    if (gateway) {
      Gateway.updateOne({
        _id: newGateway._id,
      }, {
        $set: {
          name: newGateway.name,
          deviceId: newGateway.deviceId,
        }
      }, function (err, gateway) {
        if (err) {
          console.log(err);
          return res.json({
            message: 'Emulator Gateway Register Request fail',
            gateway: gateway,
            success: false,
            error: err
          });
        }
        return res.json({
          message: 'Emulator Gateway Register Request success',
          gateway: gateway,
          success: true,
          error: err
        });
      });
    } else {
      Gateway.findOne({
          deviceId: newGateway.deviceId,
        }).then(gateway => {
          if (gateway) {
            return res.json({
              message: 'The mac address already used.',
              gateway: gateway,
              success: false
            });
          }
          newGateway.index = 1000;
          return newGateway
            .save()
            .then(() => {
              return res.json({
                message: 'Emulator Gateway request success',
                gateway: newGateway,
                success: true
              });
            })
            .catch(next);
        })
        .catch(next);
    }
  });
});


router.post('/refresh-emulator', (req, res) => {

  return res.json({
    success: true
  });
});
// update gateway firmware
router.post('/update-firmware', (req, res, next) => {
  var deviceId = req.body.gateway.deviceId;
  Gateway.findOne({
    deviceId: deviceId,
  }).then(gateway => {
    if (gateway) {
      Gateway.update({
        deviceId: deviceId
      }, {
        $set: {
          firmware: req.body.gateway.firmware
        }
      }, function (err, gateway) {
        if (err) {
          return res.json({
            message: 'Cannot update gateway',
            success: false,
            error: err
          });
        }
        return res.json({
          message: 'Updated Firmware',
          success: true,
          gateway: gateway
        });
      });
    } else {
      return res.json({
        message: 'Cannot find gateway',
        success: false
      });
    }

  });
});
// update gateway
router.put('/', (req, res) => {
  const gateway = req.body.gateway;
  gateway.deviceId = gateway.deviceId.toLowerCase();
  var devices = [];
  
  if (gateway.devices != null) {
    devices = gateway.devices.map(device => {
      return Object.assign(device, {
        gateway: device.gatewayID,
        index: 1000
      });
    });
  }

  return Gateway.findByDeviceID(gateway.deviceId)
    .populate('devices')
    .then(async gatewayInstance => {
      if (gatewayInstance == null) {
        res.json({
          success: true
        });
      } else {
        for (let i = 0; i < gatewayInstance.devices.length; i++) {
          await gatewayInstance.devices[i].remove();
        }
        // Remove connected devices
        gatewayInstance.devices = [];

        const docs = await Device.insertMany(devices);
        docs.forEach(doc => {
          gatewayInstance.devices.push(doc._id);
        });
        gatewayInstance.name = gateway.name;
        gatewayInstance.isApprove = gateway.isApprove;

        gatewayInstance.save().then(() => {
          res.json({
            success: true
          });
        });
      }
    });
});

// delete gateway by deviceId
router.delete('/:gateway/:password', (req, res, next) => {
  var gatewayID = req.gateway._id;
  var password = req.params.password;

  var licence = Config.LICENCE_KEY;
  if (password != licence && password != 'reject') {
    return util.responseHandler(res, false, 'Invalid Password', null);
  }
});

module.exports = router;