var mongoose = require("mongoose");
var fs = require('fs');
var ps = require('ps-node');
var Mux = mongoose.model("Mux");
var util = require('./util');
var Logger = util.Logger;
var config = require('../../config');

var isValid_TS_URL = function (url) {
    if (url == null) return false;
    if (url.includes('localhost') || url.includes('localhost')) return true;
    var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
    var regex = new RegExp(expression);
    // if (url.match(regex) && url.toLocaleLowerCase().endsWith('ts')) {
    if (url.match(regex)) {
        return true;
    } else {
        return false;
    }
}

var resetStatus = async function (not_id) {
    return new Promise(async (resolve, reject) => {
        try {
            var muxList = await Mux.find({ _id: { $ne: not_id } });
            for (var i = 0; i < muxList.length; i++) {
                if (muxList[i]._id === not_id) {
                    continue;
                }
                muxList[i].status = 0;
                await muxList[i].save();
            }
            resolve();
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

var getMuxerConfig = function (muxer) {
    try {
        if (muxer == null) return null;
        var channels = muxer.channels;

        if (channels == null || channels.length == 0) {
            console.log('Error url format');
            return null;
        }

        var muxerChnanels = [];
        for (var j = 0; j < channels.length; j++) {
            var muxChannel = channels[j];
            // var url = `http://192.168.1.105:8090/proxy?url=${muxChannel.channel.Live_Stream_Source}`;
            var url = muxChannel.channel.Live_Stream_Source;
            // if (muxChannel.channel.isHD) {
            //     console.log(url + ' is HD, removed');
            //     continue;
            // }
            if (muxChannel.channel.isAudio) {
                // url = 'http://159.65.83.129/api/iptv/radio?url=http://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio2_mf_p'
                url = `${config.host_url}/api/iptv/radio?url=${url}`;
            }

            var LCN = muxChannel.LCN;
            var SID = muxChannel.SID;

            if (isValid_TS_URL(url)) {
                muxerChnanels.push({
                    url: url,
                    LCN: LCN,
                    SID: SID,
                    comment: muxChannel.channel.Name
                });
            } else {
                console.log('not url format', url)
            }
        }

        var data_common = {
            "bandwidth_hz": muxer.Bandwidth,
            "constellation": muxer.Constellation,
            "guard_interval": muxer.Guard_Interval,
            "code_rate_HP": muxer.Code_Rate,
            "onid": muxer.ONID,
            "nid": muxer.NID
        };

        var data_mux0 = {
            'tsid': muxer.TSID
        };

        var data_services = [];
        
        for (i = 0; i < muxerChnanels.length; i++) {
            data_services.push({
                'comment': muxerChnanels[i].comment,
                'url': muxerChnanels[i].url,
                'lcn': 90 + i,
                'service_id': 60000 + i
            });
        };

        data_mux0['services'] = data_services;

        var totalData = {};

        totalData['common'] = data_common;
        // data['muxes'] = data_mux0; 
        var arrTmp = [data_mux0];
        totalData['muxes'] = arrTmp;

        return totalData;
    } catch (error) {
        console.log(error)
    }
    return null;
};

var notify_to_raspberry = function () {
    try {
        if (global.socket_io == null) {
            console.log('global.socket_io == null')
            return;
        }

        global.socket_io.emit('muxer-restarted');
        Logger.LOGD('SOCKET: brodcast [ muxer-restarted ]')
    } catch (error) {
        console.log(error)
    }
};

var check_muxer_run = function () {
    Mux.findOne({ status: 1 })
        .populate({
            path: 'channels.channel',
            model: 'Channel'
        })
        .then((muxer) => {
            if (muxer != null) {
                Logger.LOGD('---------------------- runMuxer --------------------------');
                runMuxer(muxer)
            } else {
                Logger.LOGE('---------------------- there is no enabled muxer --------------------------');
            }
        })
        .catch(err => Logger.LOGE(err));
};

var kill_pid = function (pid) {
    return new Promise(resolve => {
        ps.kill(pid, { signal: 'SIGKILL', timeout: 10, }, resolve);
    })
};

var kill_before_process = function () {
    return new Promise(resolve => {
        ps.lookup({
            command: 'dvb2dvb_server'
        }, function (err, resultList) {
            if (err || resultList == null) {
                console.log(err);
                resolve();
                return;
            }

            resultList.forEach(async function (process) {
                if (process) {
                    console.log('PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments);
                    await kill_pid(process.pid);
                }
            });
            resolve();
        });
    })
}
const moment = require("moment");
var run_muxer_process = async function () {

    await kill_before_process();
    console.log()
    console.log('Trying running "dvb2dvb_server _muxer_config.json"');
    var spawn = require('child_process').spawn;
    var process_path = '../dvb2dvb-server/dvb2dvb_server';
    if (process.platform == 'win32') process_path = '../dvb2dvb-server/dvb2dvb_server.exe';
    var child = spawn(process_path, [`./_muxer_config.json`]);
    global.muxer_thread = child;

    child.stdout.on('data', function (data) {
        Logger.LOG_MUXER('' + data);
        if (global.wss) {
            try {
                var jsonData = {
                    TAG: 'mux',
                    data: '' + data
                }
                global.wss.broadcast(JSON.stringify(Object.assign(jsonData, {
                    time: moment.utc(Date.now()).format("YYYY:MM:DD[T]hh:mm:ss"),
                })));

            } catch (err) { console.error(err); }
        } else {
            console.log('else')
        }
    });
    child.stderr.on('data', function (data) {
        Logger.LOG_MUXER('' + data);
        if (global.wss) {
            try {
                var jsonData = {
                    TAG: 'mux',
                    data: '' + data
                }
                global.wss.broadcast(JSON.stringify(Object.assign(jsonData, {
                    time: moment.utc(Date.now()).format("YYYY:MM:DD[T]hh:mm:ss"),
                })));

            } catch (err) { console.error(err); }
        } else {
            console.log('else')
        }
    });
    child.on('close', function (code) {
        Logger.LOG_MUXER('closing code: ' + code);
        // check_muxer_run();
    });
};

var muxer_debugger = function () {
    if (!process.env.debug) return;

    var stdin = process.openStdin();
    try {
        if (stdin.setRawMode)
            stdin.setRawMode(true);
        else {
            require('tty').setRawMode(true);
        }
    } catch (err) { console.log(err) }
    stdin.resume();
    var keyList = [];
    stdin.on('data', function (key) {
        process.stdout.write(key + '\n');
        var key_code = key.readUIntBE(0, 1);
        console.log('key_code', key_code);
        if (key_code === 0x0d) {
            for (var i = 0; i < keyList.length; i++)
                if (global.muxer_thread) global.muxer_thread.stdin.write(keyList[i]);
            keyList = [];
            return;
        }
        keyList.push(key);
        if (key === '\u0003' || key === 'q' || key.toString() == 'q') process.exit();
    });
};

var runMuxer = function (muxer) {
    return new Promise(async (resolve, reject) => {
        try {
            var totalData = getMuxerConfig(muxer);
            if (totalData == null) {
                return reject('totalData == null');
            }

            var json_str = JSON.stringify(totalData);

            fs.writeFileSync('_muxer_config.json', json_str);

            if (global.muxer_thread) {
                Logger.LOGD("Kill before muxer process");
                global.muxer_thread.kill();
                run_muxer_process();
            } else {
                run_muxer_process();
            }

            await resetStatus(muxer._id);

            muxer.status = 1;
            muxer.save()
                .then((updatedMuxer) => {
                    notify_to_raspberry();
                    return resolve('Success')
                })
                .catch(error => {
                    reject(error);
                })
        } catch (error) {
            reject(error);
        }
    })
};

module.exports = {
    getMuxerConfig: getMuxerConfig,
    runMuxer: runMuxer,
    check_muxer_run: check_muxer_run,
    run_muxer_process: run_muxer_process,
    muxer_debugger: muxer_debugger
};