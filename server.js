const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const moment = require("moment");
const path = require("path");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
var passport = require('passport');
const app = express();

const config = require('./config');
var util = require('./src/lib/util');
var Logger = util.Logger;

Logger.LOGE('-------------------------------------------------------------------------')

app.use(express.static(path.join(__dirname, "public/dist")));

app.use(bodyParser.urlencoded({
  limit: '5mb',
  extended: true
}));
app.use(bodyParser.json({
  limit: '5mb'
}));

app.use(cors());
app.use(function (err, req, res, next) {
  if (err.name === 'StatusError') {
    res.send(err.status, err.message);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(err);
  }
});
app.use(passport.initialize());
app.use(passport.session());

const server = http.createServer(app);
const wss = new WebSocket.Server({
  server
});

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        // console.log("sending data " + data);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};
global.wss = wss;
var io = require('socket.io')(server);
global.SocketIOClients = {};
global.socket_io = io;

io.on('connection', (client) => {
  var cookieDeviceId;
  Logger.LOG_SOCKET_IO(`connected ${client.id}`);

  // global.SocketIOClient = client;
  client.on('send_socket_client_id', (deviceId) => {
    cookieDeviceId = deviceId;
    Logger.LOG_SOCKET_IO(cookieDeviceId);
    console.log("cookieDeviceId" + cookieDeviceId);
    global.SocketIOClients[cookieDeviceId] = client;
  });
  client.on('FIRMWARE_DOWNLOADING', (data) => {
    console.log(data);
    try {
      var date = Date.now();

      wss.broadcast(
        JSON.stringify(
          Object.assign(data, {
            time: moment.utc(date).format("YYYY:MM:DD[T]hh:mm:ss"),
          })
        )
      );
    } catch (err) {
      console.error(err);
    }
  });
  client.on('Device_Status', (Device_Status) => {
    try {
      var date = Date.now();
      wss.broadcast(
        JSON.stringify(
          Object.assign(Device_Status, {
            time: moment.utc(date).format("YYYY:MM:DD[T]hh:mm:ss"),
          })
        ));
    } catch (err) {
      console.error(err);
    }
  });
  client.on('log', (Device_Status) => {
    try {
      var date = Date.now();
      wss.broadcast(
        JSON.stringify(
          Object.assign(Device_Status, {
            time: moment.utc(date).format("YYYY:MM:DD[T]hh:mm:ss"),
          })
        ));
    } catch (err) {
      console.error(err);
    }
  });
  

  client.on('disconnect', function () {
    Logger.LOG_SOCKET_IO(`disconnected socket.io ${client.id} ${cookieDeviceId}`);
    global.SocketIOClients[cookieDeviceId] = null;
  });
});

require("./src/models");
var authenticate = require('./src/routes/authenticate')(passport);

app.use('/api', require("./src/routes"));
var initPassport = require('./passport-init');
initPassport(passport);

app.use('/api', authenticate);

app.use(function (req, res /*, next*/) {
  res.redirect("/");
});

util.checkClientIp(function () { });

var _port = require('./config').port;
var port = normalizePort(process.env.PORT || `${_port}`);
server.listen(port, function listening() {
  console.log(`Listening on http://${server.address().address}:${port}`);
});

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

mongoose
  .connect(config.DB.URI)
  .then(() => {
    console.log("mongodb connected ...");
    var MuxerUtil = require('./src/lib/muxer-util');
    //  MuxerUtil.start_ipc();
    MuxerUtil.check_muxer_run();
    MuxerUtil.muxer_debugger();
  })
  .catch(err => {
    console.log("err", err);
    Logger.LOGE(`Cannot connect to ${config.DB.URI}`);
    process.exit();
  });