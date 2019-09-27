var md5File = require('md5-file');
const hash = md5File.sync('./public/test_small.zip');
console.log('hash',hash)