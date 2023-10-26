const User = require('../services/user.service');

exports.getDashboardStats = (req, res) => {
    User.getDashboardStats(req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Dashboard Stats'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.resetStats = (req, res) => {
    User.resetStats(req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Dashboard Stats'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.getUserProfile = (req, res) => {
    User.getUserProfile(req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning User Profile'});
        }
        else {
            res.json({data: data})
        }
    })
}