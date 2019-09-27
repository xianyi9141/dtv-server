var md5File = require('md5-file');

var dist_path = './rpi-server-dist.zip';

const hash = md5File.sync(dist_path);
console.log(hash);