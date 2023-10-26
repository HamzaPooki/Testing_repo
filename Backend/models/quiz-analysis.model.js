const sql = require("../services/db")
const config = require("config")
const prefix = config.get('User.prefixConfig')
const table = config.get('User.tableConfig')

const QuizAnalysis = function(quizAnalysis) {
    this.quizId = quizAnalysis.quizId
}

// Returns Quiz Analysis //
function getQuizAnalysis(quizId, userId, questions) {
    let query = `SELECT qr.question_id as QuestionID, subT.post_title as QSubject, sysT.post_title as QSystem, topT.post_title as QTopic,
                 JSON_VALUE(qr.answer_data,'$.correct') AS Answer
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

module.exports = { QuizAnalysis, getQuizAnalysis }