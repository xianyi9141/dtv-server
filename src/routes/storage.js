var router = require("express").Router();
var config = require("../../config");
var STORAGE_DIR = config.STORAGE_PATH

router.get("/download/:filename", (req, res) => {
    var filename = req.params.filename;
    res.download(`./${STORAGE_DIR}/${filename}`);
});

module.exports = router;