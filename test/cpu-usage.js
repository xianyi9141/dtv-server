var usage = require('usage');

var pid = process.pid // you can use any valid PID instead
usage.lookup(pid, function (err, result) {
    console.log(err,result)
});