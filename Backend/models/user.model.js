const sql = require("../services/db")
const config = require("config")
const prefix = config.get('User.prefixConfig')
const table = config.get('User.tableConfig')

const User = function(user) {
    this.userId = user.userId
}

// Returns Total Count of Questions //
function getTotalQuestionsCount() {
    let query = `SELECT COUNT(*) as Total FROM ${prefix.prefix}_learndash_pro_quiz_question`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Returns Quiz Stats //
function getQuizStats(userId) {
    let query = `SELECT quiz_id as quizId, JSON_VALUE(quiz_meta, '$.quizScore') as quizScore, 
                 JSON_VALUE(quiz_meta, '$.quizTime') as quizTime, JSON_VALUE(quiz_meta, '$.quizStatus') as quizStatus,
                 JSON_VALUE(quiz_meta, '$.quizTotalQuestions') as quizTotalQuestions, JSON_VALUE(quiz_meta, '$.quizQuestions') as quizQuestions
                 FROM ${table.table}_previous_quizzes
                 WHERE user_id = ${userId}`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Returns Question Stats //
function getQuestionStats(userId, questions) {
    let query = `SELECT qr.question_id as QuestionID, subT.post_title as QSubject, JSON_VALUE(qr.answer_data,'$.correct') AS Answer
                 FROM ${table.table}_quiz_reports qr
                 LEFT JOIN ${prefix.prefix}_postmeta subID
                 ON subID.post_id = qr.question_id
                 AND subID.meta_key = 'subject'
                 LEFT JOIN ${prefix.prefix}_posts subT
                 ON subID.meta_value = subT.ID
                 WHERE qr.question_id IN (${questions})
                 AND user_id = '${userId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Delete Quizzes //
function deleteQuizzes(userId) {
    let query = `DELETE FROM ${table.table}_previous_quizzes WHERE user_id = '${userId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Delete Quiz Reports //
function deleteQuizReports(userId) {
    let query = `DELETE FROM ${table.table}_quiz_reports WHERE user_id = '${userId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Delete Suspended Stats //
function deleteSuspendedStats(userId) {
    let query = `DELETE FROM ${table.table}_suspended_stats WHERE user_id = '${userId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Delete User Notes //
function deleteUserNotes(userId) {
    let query = `DELETE FROM ${table.table}_user_notes WHERE user_id = '${userId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Delete Marked Questions //
function deleteMarkedQuestions(userId) {
    let query = `DELETE FROM ${table.table}_user_marked_questions WHERE user_id = '${userId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Returns User Profile //
function getUserProfile(userId) {
    let query = `SELECT display_name, user_login, user_email FROM ${prefix.prefix}_users WHERE ID = '${userId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Update Two Factor Authentication //
function updateTwoFactorAuthentication(userId, token) {
    let query = `INSERT INTO ${table.table}_two_fac_auth (userId, token, loginTime)
                 VALUES ('${userId}', '${token}', CURRENT_TIMESTAMP)
                 ON DUPLICATE KEY UPDATE userId = '${userId}', token = '${token}', loginTime = CURRENT_TIMESTAMP`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Check Two Factor Authentication //
function checkTwoFactorAuthentication(token) {
    let query = `SELECT * FROM ${table.table}_two_fac_auth WHERE token = '${token}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Returns Two Factor Authentication //
function getTwoFactorAuthentication(userId) {
    let query = `SELECT * FROM ${table.table}_two_fac_auth WHERE userId = '${userId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

module.exports = { User, getTotalQuestionsCount, getQuizStats, getQuestionStats, deleteQuizzes, deleteQuizReports, deleteSuspendedStats,
                   deleteUserNotes, deleteMarkedQuestions, getUserProfile, updateTwoFactorAuthentication, checkTwoFactorAuthentication,
                   getTwoFactorAuthentication }