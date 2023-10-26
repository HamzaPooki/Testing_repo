const Authentication = require('../services/authentication.service');

exports.login = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    Authentication.login(req.body.user, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Login User'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.twoFactorAuthentication = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    Authentication.twoFactorAuthentication(req.body.user, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Authenticating User'});
        }
        else {
            res.json({data: data})
        }
    })
}