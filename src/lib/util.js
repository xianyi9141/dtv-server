var chalk = require('chalk');
var bCrypt = require('bcrypt-nodejs');
var fs = require('fs');
var config = require('../../config');

function findMainBackFile(filePath, callback) {
  var items = fs.readdirSync(filePath);

  var isFound = false;
  for (var i = 0; i < items.length; i++) {
    var backFileName = items[i];
    try {
      if (backFileName.includes('main.') && backFileName.includes('_back')) {

        isFound = true;

        var originFilename = backFileName.replace('_back', '');
        var text = fs.readFileSync(`${filePath}/${backFileName}`, { encoding: 'utf-8' });

        if (!text.includes('127.0.0.1')) {
          console.error("Not found 127.0.0.1");
          callback(false, 'Not found 127.0.0.1')
          return;
        }
        text = text.replace(/127\.0\.0\.1/g, config.ip_url);

        fs.writeFileSync(`${filePath}/${originFilename}`, text, 'utf-8');
      }
    } catch (err) {
      console.log(err);
    }

    if (isFound) break;
  } // for

  if (!isFound) callback(false, 'not found');
  else callback(true, 'found')
};


function makeMainBack(filePath) {
  var items = fs.readdirSync(filePath)
  var isFound = false;
  for (var i = 0; i < items.length; i++) {
    var fileName = items[i];
    try {
      if (!fileName.includes('main.')) continue;

      if (fileName.includes('_back')) continue;
      isFound = true;
      fs.copyFileSync(`${filePath}/${fileName}`, `${filePath}/${fileName}_back`);

      fs.readFile(`${filePath}/${fileName}`, {
        encoding: 'utf-8'
      }, function (error, text) {
        if (error || !text) {
          return;
        }
        if (!text.includes('127.0.0.1')) {
          console.error("Not found 127.0.0.1");
          return;
        }

        var newText = text.replace(/127\.0\.0\.1/g, config.ip_url);

        fs.unlink(`${filePath}/${fileName}`, function (error) {

          fs.writeFile(`${filePath}/${fileName}`, newText, 'utf-8', function (error, txt) {
            console.log(error, txt)
          });
        });

      });

    } catch (err) { }

    if (isFound) break;
  }
}

module.exports = {
  responseHandler: (res, success, message, data) => {
    res.send({
      success: success,
      message: message,
      data: data,
    });
  },
  createHash: function (password) {
    password = String(password);
    var hash = bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    // var hash = md5(password)
    console.log(chalk.yellowBright('password', password, typeof (password), hash));
    return hash;
  },
  checkClientIp: () => {
    findMainBackFile(config.WEB_SOURCE, function (success, error) {
      if (success) {
        return;
      }
      console.log(error, 'called make Main Back');
      makeMainBack(config.WEB_SOURCE);
    });
  },
  Logger: {
    LOGE: function (message) {
      if (typeof message == 'object') {
        try {
          console.log(chalk.red(JSON.stringify(message, null, 2)));
        } catch (err) { }
        return;
      }
      if (typeof message == 'string') {
        console.log(chalk.red(message));
        return;
      }
    },
    LOGR: function (message) {
      if (typeof message == 'object') {
        try {
          console.log(chalk.yellowBright(JSON.stringify(message, null, 2)));
        } catch (err) { }
        return;
      }
      if (typeof message == 'string') {
        console.log(chalk.yellowBright(message));
        return;
      }
    },
    LOGW: function (message) {
      if (typeof message == 'object') {
        try {
          console.log(chalk.yellowBright('WARN: ', JSON.stringify(message, null, 2)));
        } catch (err) { }
        return;
      }
      if (typeof message == 'string') {
        console.log(chalk.yellowBright('WARN: ', message));
        return;
      }
    },
    LOGD: function (message) {
      if (typeof message == 'object') {
        try {
          console.log(chalk.green(JSON.stringify(message, null, 2)));
        } catch (err) { }
        return;
      }
      if (typeof message == 'string') {
        console.log(chalk.green(message));
        return;
      }
    },
    LOG_MUXER: function (message) {
      if (typeof message == 'object') {
        try {
          console.log(chalk.red('MUXER: '), JSON.stringify(message, null, 2));
        } catch (err) { }
        return;
      }
      if (typeof message == 'string') {
        console.log(chalk.red('MUXER: '), message);
        return;
      }
    },
    LOG_IPC: function (message) {
      if (typeof message == 'object') {
        try {
          console.log(chalk.red('IPC: '), JSON.stringify(message, null, 2));
        } catch (err) { }
        return;
      }
      if (typeof message == 'string') {
        console.log(chalk.red('IPC: '), message);
        return;
      }
    },
    LOG_SOCKET_IO: function (message) {
      if (typeof message == 'object') {
        try {
          console.log(chalk.yellowBright('SOCKET_IO: '), JSON.stringify(message, null, 2));
        } catch (err) { }
        return;
      }
      if (typeof message == 'string') {
        console.log(chalk.yellowBright('SOCKET_IO: '), message);
        return;
      }
    },

  },

};