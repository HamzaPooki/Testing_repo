const jwt = require("jsonwebtoken");
const config = require("config");
const keyConfig = config.get('User.keyConfig')
const { checkTwoFactorAuthentication } = require("../../models/user.model");

const checkToken = async (req, res, next) => {
    let token = req.headers['authorization'];
    if (token) {
        let userQuery = await checkTwoFactorAuthentication(token)
        if (userQuery.length > 0) {
            jwt.verify(token, keyConfig.key, (err, decoded) => {
                if(err) {
                    return res.status(401).send({
                        status: false,
                        msg: "Token Invalid!"
                    })
                }
                else {
                    req.body.userId = decoded.userId
                    req.decoded = decoded;
                    next();
                }
            })
        }
        else {
            return res.status(401).send({
                status: false,
                msg: "Token Invalid!"
            }) 
        }
    }

    
    else {
        return res.status(401).send({
            status: false,
            msg: "Token Invalid!"
        })
    }
};



module.exports = {
    checkToken: checkToken,
};