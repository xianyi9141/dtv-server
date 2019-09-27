var azure = require('azure-storage');
var accountName = 'testpolice';
var accountConnectStr = 'DefaultEndpointsProtocol=https;AccountName=calmgwatewaystorage;AccountKey=35iW0iCQY9HRhPblMgueE1QeWD8LbALqSnWZZ8rb650txhLlQO6LTuC3rx1Szz39QOuU+RXn+2eIsMMWBTmFxQ==;EndpointSuffix=core.windows.net';
var fileService = azure.createFileService(accountConnectStr);
var SHARE_NAME = 'calm-share';
var DIRECTORY = 'wfdb';


const express = require('express');
const app = express();
const http = require('http');
var fs = require('fs');

app.get('/', (req, res) => {
    // http.get('http://www.fillmurray.com/200/300', (response) => {
    //     res.setHeader('Content-disposition', 'attachment; filename=' + 'hello.jpg');
    //     res.setHeader('Content-type', 'application/octet-stream');
    //     response.pipe(res)
    // });

    fileService.getFileToStream(SHARE_NAME, DIRECTORY, 'read.js', res, function (error, result, response) {
        if (!error) {
            // file retrieved
            console.log(result)
        }
    });

});

app.listen(3001, () => console.log(('listening :)')))