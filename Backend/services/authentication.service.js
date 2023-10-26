const config = require("config")
const keyConfig = config.get('User.keyConfig')
const jwt = require("jsonwebtoken");
const hasher = require('wordpress-hash-node');
const authenticator = require('otplib');
const nodemailer = require('nodemailer')

const { Authentication, checkIfUserExists } = require('../models/authentication.model');
const { updateTwoFactorAuthentication, checkTwoFactorAuthentication, getTwoFactorAuthentication } = require("../models/user.model");

// User Login Function //
Authentication.login = async (user, result) => {
    try {
        let authenticationResponse = false;
        let userQuery = await checkIfUserExists(user)
        if (userQuery.length > 0) {
            // let flag = await verifyAdminship(res[0].ID);
            // flag = !!flag.administrator;
            let flag = false;
            
            let wordpressHashPass = userQuery[0].user_pass
            authenticationResponse = hasher.CheckPassword(user.user_pass, wordpressHashPass);
            if (authenticationResponse) {
                let token = jwt.sign({email: userQuery[0].user_email, userId: userQuery[0].ID}, keyConfig.key, {
                    expiresIn: "24h",
                });

                let authenticationQuery = await updateTwoFactorAuthentication(userQuery[0].ID, token)

                authenticator.totp.options = {
                    'digits': 6,
                    'epoch': Date.now(),
                    'step': 60
                }
                let code = authenticator.totp.generate(keyConfig.key);

                // let transporter = nodemailer.createTransport({
                //     host: 'smtp.gmail.com',
                //     port: 465,
                //     secure: true,
                //     auth:
                //     {
                //         type: 'OAuth2',
                //         user: 'info@pookidevs.com',
                //         clientId: '858351344140-lokcee0npnm5v4n6ob2oqccdg3ucuc0t.apps.googleusercontent.com',
                //         clientSecret: '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',
                //         accessToken: 'ya29.A0ARrdaM97FWh3Ju4PqxfZz0t1laThJsXKfZWPxCNF7sky37MAEY0dbc-RtAcaa1_KbTQosx80BihUcplPTmS52ArX_ui1Sg8oXtRTMF_ty4ohXXYN6n1Sh_XqDT01k8ZZixgI1Hota37L3_IFfO6UL4Ii44B0',
                //         refreshToken: '1//04L3nt7dFINiSCgYIARAAGAQSNwF-L9IreNmgNmo7YINTVXlQ4E-5eZQc-uyKuoK5rq--xHC64au9JiJIBkxJSqDgI1Gknw1b_VI'
                //     }
                // });   
        
                // let mailDetails = {
                //     from: '"PookiDevs Technologies" <info@pookidevs.com>',
                //     to: userQuery[0].user_email,
                //     subject: "Two Factor Authentication",
                //     text: `Your code ${code} is valid for 60 seconds`
                // }
 
                // transporter.sendMail(mailDetails, function(err, data) {
                //     if (err) {
                //         result(null, {
                //             status: false, 
                //             err
                //         })
                //         return;
                //     }
                //     else {
                        result(null, {
                            status: true,
                            ID: userQuery[0].ID, 
                            username: userQuery[0].user_nicename,
                            ifAdmin: flag,
                            token: token
                        });
                        return;
                //     }
                // })
            }
            else {
                result(null, {status: false, message: 'Invalid Password'});
            }
        }
        else {
            result(null, {status: false, message: 'Invalid Username or Email'});
        }
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

// User Login Function //
Authentication.twoFactorAuthentication = async (user, result) => {
    try {
        let authenticationQuery = await getTwoFactorAuthentication(user.userId)
        const isValid = authenticator.totp.check(user.code, keyConfig.key);
        if (isValid) {
            result(null, {
                status: true,
                token: authenticationQuery[0].token
            });
        }
        else {
            result(null, {
                status: false,
                token: null,
                message: "Invalid Code"
            });
        }
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

module.exports = Authentication