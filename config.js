var LICENCE_KEY = '123456';
var port = 80;
var host_url = `159.65.83.129`;
// var host_url = `192.168.1.105`;
var client_url = `http://${host_url}/#`;
var mongodb_url = `mongodb://localhost:27017/dtv-db`;
// var mongodb_url = `mongodb://192.168.1.105:27017/dtv-db`;

var default_auth_email = "zzbb8855@gmail.com"
var default_auth_password = "123456khs"

module.exports = {
  LICENCE_KEY: LICENCE_KEY,
  DB: { URI: mongodb_url },
  port: port,
  host_url: `http://${host_url}:${port}`,
  ip_url: host_url,
  socket_url: host_url,
  client_url: client_url,
  STORAGE_PATH: './public/storage',
  WEB_SOURCE: './public/dist',
  email: {
    auth_email: function () {
      try { return require('./gmail.js').email; } catch (error) { }
      return default_auth_email;
    },
    auth_password: function () {
      try { return require('./gmail.js').password; } catch (error) { }
      return default_auth_password;
    }
  }
};