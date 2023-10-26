const sql = require("../services/db")
const config = require("config")
const prefix = config.get('User.prefixConfig')
const table = config.get('User.tableConfig')

const QuizResult = function(quizResult) {
    this.quizId = quizResult.quizId
}

// Returns Quiz Stats //
function getQuizStats(quizId, userId) {
    let query = `SELECT quiz_id as quizId, JSON_VALUE(quiz_meta, '$.quizScore') as quizScore, 
                 JSON_VALUE(quiz_meta, '$.quizTime') as quizTime, JSON_VALUE(quiz_meta, '$.quizStatus') as quizStatus,
                 JSON_VALUE(quiz_meta, '$.quizTotalQuestions') as quizTotalQuestions, JSON_VALUE(quiz_meta, '$.quizQuestions') as quizQuestions
                 FROM ${table.table}_previous_quizzes
                 WHERE quiz_id = ${quizId} AND user_id = ${userId}`;
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
function getQuestionStats(quizId, userId) {
    let query = `SELECT answer_data FROM ${table.table}_quiz_reports 
                 WHERE quiz_id = ${quizId} AND user_id = ${userId}`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Returns Quiz Results //
function getQuizResults(quizId, userId, questions) {
    let query = `SELECT qr.question_id as QuestionID, subT.post_title as QSubject, sysT.post_title as QSystem, topT.post_title as QTopic,
                 JSON_VALUE(qr.answer_data,'$.correct') AS QuestionStatus
                 FROM ${table.table}_quiz_reports qr
                 LEFT JOIN ${prefix.prefix}_postmeta subID
                 ON subID.post_id = qr.question_id
                 AND subID.meta_key = 'subject'
                 LEFT JOIN ${prefix.prefix}_postmeta sysID
                 ON sysID.post_id = qr.question_id
                 AND sysID.meta_key = 'system'
                 LEFT JOIN ${prefix.prefix}_postmeta topID
                 ON topID.post_id = qr.question_id
                 AND topID.meta_key = 'topic'
                 LEFT JOIN ${prefix.prefix}_posts subT
                 ON subID.meta_value = subT.ID
                 LEFT JOIN ${prefix.prefix}_posts sysT
                 ON sysID.meta_value = sysT.ID
                 LEFT JOIN ${prefix.prefix}_posts topT
                 ON topID.meta_value = topT.ID
                 WHERE qr.question_id IN (${questions})
                 AND quiz_id = '${quizId}' 
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

module.exports = { QuizResult, getQuizStats, getQuestionStats, getQuizResults }