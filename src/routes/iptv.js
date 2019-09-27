var router = require("express").Router();
var SlowStream = require('slow-stream');
var fs = require('fs');
router.get('/test.ts', async function (req, res, next) {
    var readStream = fs.createReadStream('../iptv-server/testLarge100.ts', { bufferSize: 64 });
    readStream
        // .pipe(new SlowStream({ maxWriteInterval: 400 })) // 10 -> 5.62MB, 100 -> 641KB [OK], 1000 - debug
        .pipe(new SlowStream({ maxWriteInterval: 200 }))
        .pipe(res);
});

router.get('/test2.ts', function (req, res, next) {
    var readStream = fs.createReadStream('../iptv-server/212.ts', { bufferSize: 64 });
    readStream
        // .pipe(new SlowStream({ maxWriteInterval: 400 })) // 10 -> 5.62MB, 100 -> 641KB [OK], 1000 - debug
        .pipe(new SlowStream({ maxWriteInterval: 200 }))
        .pipe(res);
});
router.get('/', function (req, res, next) {
    var readStream = fs.createReadStream('../iptv-server/testLarge100.ts', { bufferSize: 64 });
    readStream
        // .pipe(new SlowStream({ maxWriteInterval: 400 })) // 10 -> 5.62MB, 100 -> 641KB [OK], 1000 - debug
        .pipe(new SlowStream({ maxWriteInterval: 200 }))
        .pipe(res);
});

var ffmpeg = require('fluent-ffmpeg');
var cp = require("child_process");
var spawn = cp.spawn;

router.post('/video_resolution', (req, res) => {
    ffmpeg.ffprobe(req.body.url, function (err, metadata) {
        res.json({ success: true, data: metadata });
    });
});

router.get('/radio', function (req, res, next) {
    // http://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio2_mf_p
    var url = req.query.url;
    var params = `-i ${url} -f mpegts -`.split(' ');
    var x = "";
    for (var i = 0; i < params.length; ++i) {
        x += " ";
        x += params[i];
    };
    // console.log("ffmpeg " + x);

    var process = spawn("ffmpeg", params);
    process.on('exit', (code) => {
        setTimeout(() => res.end(), 3000);
    });

    req.on('close', function (err) {
        console.log('Request closed');
        process.kill();
    });

    var stream = process.stdout;

    stream.on("data", function (data) {
        try {
            if (!(data && data.length)) {
                return;
            };
            // console.log(data.length);
            res.write(data);
        } catch (e) { };
    });
    stream.on("error", function (err) {
        console.log("radio some stream error");
        console.log(err);
    });
});

module.exports = router;