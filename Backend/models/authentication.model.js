const sql = require("../services/db")
const config = require("config")
const prefix = config.get('User.prefixConfig')

const Authentication = function(authentication) {
    this.userId = authentication.userId
}

// Checking If User Exists in wp_users Table //
function checkIfUserExists(user) {
    let query = `SELECT * FROM ${prefix.prefix}_users WHERE (user_email='${user.user_email}' OR user_nicename='${user.user_email}')`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        })
    });
}

module.exports = { Authentication, checkIfUserExists }
