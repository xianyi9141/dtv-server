var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    nev = require('email-verification')(mongoose);


var Util = require('../lib/util');
var email_template = require('../../public/assets/email-template/template');

var configModel = mongoose.model('Config');
var Account = mongoose.model('Account')
var async = require('async');
var crypto = require('crypto');

var nodemailer = require('nodemailer');
// sync version of hash ing function
var myHasher = function (password, tempUserData, insertTempUser, callback) {
    var hash = Util.createHash(password);
    console.log('hash', password, hash)
    return insertTempUser(hash, tempUserData, callback);
};
var errorHandler = function (res, err, msg) {
    console.log('Error', err, msg);
    Util.responseHandler(res, false, msg, null);
}
var auth_email = require('../../config').email.auth_email();
var password = require('../../config').email.auth_password();
console.log(auth_email, password)
nev.configure({
    verificationURL: require('../../config').host_url + '/api/email-verification/${URL}',
    persistentUserModel: Account,
    tempUserCollection: `tempaccounts`,
    emailFieldName: 'username',
    expirationTime: 600,
    shouldSendConfirmation: false,
    transportOptions: {
        service: 'Gmail',
        auth: {
            user: auth_email,
            pass: password
        }
    },
    hashingFunction: myHasher,
    verifyMailOptions: {
        from: 'WEB <myawesomeemail_do_not_reply@gmail.com>',
        subject: 'Please confirm account',
        html: email_template('signup'),
        text: 'Please confirm your account by clicking the following link: ${URL}'
    }
}, function (error, options) {
    // console.log(error, options);
});

nev.generateTempUserModel(Account, (err, model) => {
    // console.log(err, model);
});

module.exports = function (passport) {

    //log in
    router.post('/login', (req, res, next) => {
        passport.authenticate('login', (err, user, info) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Server Authentication Error...'
                });
                return next(err);
            }
            if (!user) {
                return res.send({
                    success: false,
                    message: 'Invalid username or password...'
                });
            }
            req.login(user, loginErr => {
                if (loginErr) {
                    return next(loginErr);
                }
                return res.send({
                    success: true,
                    message: 'Successfully logged in...',
                    data: {
                        user: user
                    }
                });
            });
        })(req, res, next);
    });
    //sign up
    router.post('/signup', (req, res, next) => {
        Util.Logger.LOGD("signup")
        var newUser = Account({
            username: req.body.username,
            password: req.body.password,
            firstname: req.body.firstname,
            secondname: req.body.lastname,
            address1: '',
            address2: '',
            city: '',
            country: '',
            sec_question: req.body.sec_question,
            sec_answer: req.body.sec_answer,
            type: '',
            photo: '/assets/gravatar/default.jpg',
            config: null,
            patients: [],
            gateways: [],
            accounts: [],
            shares: []
        });
        nev.createTempUser(newUser, function (err, existingPersistentUser, newTempUser) {
            // some sort of error
            if (err) {
                errorHandler(res, err, "Unexpected error while creating temp user");
                return;
            }

            // user already exists in persistent collection...
            if (existingPersistentUser) {

                Util.responseHandler(res, false, "Account already exists", null);
                return;
            }

            // a new user
            if (newTempUser) {
                var URL = newTempUser[nev.options.URLFieldName];
                nev.sendVerificationEmail(req.body.username, URL, function (err, info) {
                    if (err) {
                        errorHandler(res, err, "Unexpected Error while sending verification email");
                        return;
                    } else {
                        console.log("Verification email sent");
                        Util.responseHandler(res, true, "Verification email has sent to your email address. Please check out your email inbox.", null);
                        return;
                    }
                });

                // user already exists in temporary collection...
            } else {
                console.log('Resending verification email');
                nev.resendVerificationEmail(req.body.username, function (err, success) {

                    if (err) {
                        errorHandler(res, err, "Unexpected Error while resending verification email");
                        return;
                    } else {
                        console.log("Verification email resent");
                        Util.responseHandler(res, true, "Verification email has resent to your email address. Please check out your email inbox.", null);
                        return;
                    }
                });
                return;
            }
        });
    });
    // user accesses the link that is sent
    router.get('/email-verification/:URL', function (req, res) {
        Util.Logger.LOGD("confirm")
        var url = req.params.URL;

        nev.confirmTempUser(url, function (err, user) {

            var client_url = require('../../config').client_url;
            if (user) {
                if (err) {
                    errorHandler(res, err, "Error while confirming user");
                    return;
                }
                var config = new configModel({
                    region: null,
                    language: null,
                    newsletter: null,
                    units: null,
                    subscription: null,
                    upload_freq: 10,
                    polling_freq: 10,
                    login_everytime: true
                });

                config.save((err, doc, num) => {
                    if (!err) {
                        Account.findByIdAndUpdate(user._id, {
                            config: mongoose.Types.ObjectId(doc._id)
                        }, (err, doc) => {
                            // console.log(err, doc)
                        }
                        );
                    }
                })

                res.redirect(client_url);
            } else {
                res.redirect(client_url);
            }
        });
    });
    router.post('/forgot-password', (req, res, next) => {
        async.waterfall([
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function (token, done) {

                Account.findOne({
                    username: req.body.username,
                    // sec_question: req.body.sec_question,
                    // sec_answer: req.body.sec_answer
                }, function (err, user) {
                    if (!user) {
                        Util.responseHandler(res, false, "No account with that email address exists or invalid answer", null);
                        return;
                    }
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save().then((doc) => {
                        console.log(doc, 'forgot password');
                        done(null, token, doc);
                    })
                });
            },
            function (token, user, done) {
                var smtpTransport = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: auth_email,
                        pass: password
                    }
                });

                var mailOptions = {
                    from: `Web <${auth_email}>`,
                    to: user.username,
                    subject: 'Password reset request',
                    html: email_template('reset-password', {
                        host: require('../../config').client_url,
                        token: token
                    })
                };
                smtpTransport.sendMail(mailOptions, function (err, info) {
                    // console.log('sendMail', err, info);
                    if (!err)
                        Util.responseHandler(res, true, "Email has sent to your address. \nPlease checkout your mailbox.")
                    done(err, 'done');
                });
            }
        ], function (err) {
            if (err) return next(err);
            // res.redirect('/');
        });
    });
    router.get('/reset-password/:token', (req, res, next) => {
        res.render('index.html');
    });

    router.get('/get-user-list/', (req, res, next) => {
        Account.find()
            .then((userList) => {
                return Util.responseHandler(res, true, "Success", userList);
            })
            .catch(err => {
                return Util.responseHandler(res, false, "Error", err);
            });
    });

    router.post('/reset-password/:token', (req, res) => {
        console.log('reset-password', req.body)
        var password = req.body.password
        async.waterfall([
            function (done) {
                Account.findOne({
                    resetPasswordToken: req.params.token,
                    resetPasswordExpires: {
                        $gt: Date.now()
                    }
                }, function (err, user) {
                    if (user == null) {
                        return Util.responseHandler(res, false, "Unexpected error while resetting password", null);
                    }
                    console.log('reset password', user);
                    user.password = Util.createHash(password);
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    user.save(function (err) {
                        return Util.responseHandler(res, true, "Successfully updated", null);

                    });
                });
            }
        ], function (err) {
            if (err) return next(err);
            // res.redirect('/');
        });
    });

    return router;
}