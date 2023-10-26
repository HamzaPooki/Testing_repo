const sql = require("../services/db")
const config = require("config")
const table = config.get('User.tableConfig')

const QuizFeedbacks = function(quizFeedbacks) {
    this.quizId = quizFeedbacks.quizId
}

// Add Feedbacks //
async function addFeedbacks(data, userId) {
    const flag = await checkIfItemExists(data.questionId, data.quizId, userId, data.tableName);
    let query = '';

    if (flag === 0) {
        query = `INSERT INTO ${table.table}_user_feedbacks (question_id, user_id, quiz_id, feedback) VALUES ('${data.questionId}', '${userId}', '${data.quizId}', '${data.feedback}')`;
    }
    else {
        query = `UPDATE ${table.table}_user_feedbacks SET feedback = '${data.feedback}' WHERE user_id = '${userId}' AND question_id = '${data.questionId}' AND quiz_id = '${data.quizId}'`;
    }
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Check Whether the Required Item Exists or Not //
function checkIfItemExists(questionId, quizId, userId, tableName) {
    let query = `SELECT COUNT(*) AS total FROM ${table.table}_user_${tableName} WHERE question_id = '${questionId}' AND user_id = '${userId}' AND quiz_id = '${quizId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response[0].total);
        });
    });
}

module.exports = { QuizFeedbacks, addFeedbacks }