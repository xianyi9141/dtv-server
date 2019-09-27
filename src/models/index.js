require('./engine');
require('./channel');
require('./log');
require('./share');
require('./share-log');

require('./device');
require('./gateway');
require('./mqtt_broker');
require('./user');
require('./configSchema');
require('./share-channel');
require('./mux');
require('./transfer');


const mongoose = require('mongoose');

module.exports = {
  Engine: mongoose.model('Engine'),
  Channel: mongoose.model('Channel'),
  Log: mongoose.model('Log'),
  Share: mongoose.model('Share'),
  ShareLog: mongoose.model('ShareLog'),

  Gateway: mongoose.model('Gateway'),
  Device: mongoose.model('Device'),
  Account: mongoose.model('Account'),
  Config: mongoose.model('Config'),
  ShareChannel: mongoose.model('ShareChannel'),
  Mux: mongoose.model('Mux'),
  Transfer: mongoose.model('Transfer')
};