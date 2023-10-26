const sql = require("../services/db")
const config = require("config")
const prefix = config.get('User.prefixConfig')
const table = config.get('User.tableConfig')

const QuizSolver = function(quizSolver) {
    this.quizId = quizSolver.quizId
}

// Mark Question as Flagged or Not //
async function markQuestion(data, userId) {
    const flag = await checkIfItemExists(data.questionId, userId, data.tableName);
    const flagMarked = data.isMarked;
    let query = '';

    if (flagMarked) {
        if (flag === 0) {
            query = `INSERT INTO ${table.table}_user_marked_questions (question_id, user_id) VALUES ('${data.questionId}', '${userId}')`;
        }
        else {
            return new Promise((resolve, reject) => {
                const response = [];
                resolve(response);
            })
        }
    }
    else {
        if (flag !== 0) {
            query = `DELETE FROM ${table.table}_user_marked_questions WHERE question_id = '${data.questionId}' AND user_id = '${userId}'`;
        }
        else {
            return new Promise((resolve, reject) => {
                const response = [];
                resolve(response);
            })
        }
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
function checkIfItemExists(questionId, userId, tableName) {
    let query = `SELECT COUNT(*) AS total FROM ${table.table}_user_${tableName} WHERE question_id = '${questionId}' AND user_id = '${userId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response[0].total);
        });
    });
}

// Save Answer To Suspended Stats Table //
async function saveAnswerToSuspendedStats(userId, quiz) {
    let values = []
    for (let i = 0; i < quiz.selectedOptionsArray.length; i++) {

        Temp = new Array();

        Temp.push(userId);
        Temp.push(quiz.selectedOptionsArray[i].index);
        Temp.push(quiz.quizId);
        Temp.push(JSON.stringify(quiz.selectedOptionsArray[i]));

        values.push(Temp);
    }

    query = `INSERT INTO ${table.table}_suspended_stats (user_id, question_id, quiz_id, answer_data) VALUES ?`;
    return new Promise((resolve, reject) => {
        sql.query(query, [values], (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Save Answer To Quiz Reports Table //
async function saveAnswerToQuizReports(userId, quiz) {
    let questionIds = []

    for (let i = 0; i < quiz.selectedOptionsArray.length; i++) {
        questionIds.push(quiz.selectedOptionsArray[i].index)
    }

    let quizReportsQuery = await getQuizReports(userId, questionIds)

    if (quizReportsQuery.length > 0) {
        let meta;
        for (let i = 0; i < quizReportsQuery.length; i++) {
            for (let j = 0; j < quiz.selectedOptionsArray.length; j++) {
                meta = JSON.parse(quizReportsQuery[i].answer_data)
                if (meta.index === quiz.selectedOptionsArray[j].index) {
                    if (meta.correct === 1 && quiz.selectedOptionsArray[j].correct === 1) {
                        quiz.selectedOptionsArray[j].stat = 1;
                    }
                    if (meta.correct === 1 && quiz.selectedOptionsArray[j].correct !== 1) {
                        quiz.selectedOptionsArray[j].stat = 2;
                    }
                    if (meta.correct !== 1 && quiz.selectedOptionsArray[j].correct === 1) {
                        quiz.selectedOptionsArray[j].stat = 3;
                    }
                    if (meta.correct !== 1 && quiz.selectedOptionsArray[j].correct !== 1) {
                        quiz.selectedOptionsArray[j].stat = 4;
                    }
                }
            }
        }

        let values = []
        for (let i = 0; i < quiz.selectedOptionsArray.length; i++) {
            if (!quiz.selectedOptionsArray[i].stat) {
                quiz.selectedOptionsArray[i].stat = 5
            }

            Temp = new Array();

            Temp.push(userId);
            Temp.push(quiz.selectedOptionsArray[i].index);
            Temp.push(quiz.quizId);
            Temp.push(JSON.stringify(quiz.selectedOptionsArray[i]));

            values.push(Temp);
        }

        query = `INSERT INTO ${table.table}_quiz_reports (user_id, question_id, quiz_id, answer_data) VALUES ?`;
        return new Promise((resolve, reject) => {
            sql.query(query, [values], (err, response) => {
                if (err) {
                    return reject(err);
                }
                resolve(response);
            });
        });
    }
    else {
        let values = []
        for (let i = 0; i < quiz.selectedOptionsArray.length; i++) {
            quiz.selectedOptionsArray[i].stat = 5;

            Temp = new Array();

            Temp.push(userId);
            Temp.push(quiz.selectedOptionsArray[i].index);
            Temp.push(quiz.quizId);
            Temp.push(JSON.stringify(quiz.selectedOptionsArray[i]));

            values.push(Temp);

        }

        query = `INSERT INTO ${table.table}_quiz_reports (user_id, question_id, quiz_id, answer_data) VALUES ?`;
        return new Promise((resolve, reject) => {
            sql.query(query, [values], (err, response) => {
                if (err) {
                    return reject(err);
                }
                resolve(response);
            });
        });
    }
}

// Update New Quiz //
function updateNewQuiz(quiz, userId){
    let query = `UPDATE ${table.table}_previous_quizzes SET quiz_meta = '${JSON.stringify(quiz)}' WHERE user_id = '${userId}' AND quiz_id = '${quiz.quizId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Get Quiz Reports //
function getQuizReports(userId, questionIds) {
    let query = `SELECT * FROM ${table.table}_quiz_reports WHERE user_id = '${userId}' AND question_id IN (${questionIds})`;
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
function deleteQuizReports(data, userId) {
    let query = `DELETE FROM ${table.table}_quiz_reports WHERE user_id = '${userId}' AND quiz_id = '${data.quiz.quizId}'`;
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
function deleteSuspendedStats(data, userId){
    let query = `DELETE FROM ${table.table}_suspended_stats WHERE user_id = '${userId}' AND quiz_id = '${data.quiz.quizId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Fetch Previous Quizzes //
function fetchPreviousQuizzes(quizId, userId) {
    let query = `SELECT * FROM ${table.table}_previous_quizzes WHERE quiz_id = ${quizId} AND user_id = ${userId}`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Returns Details of All Questions //
function getDetailsOfQuestion(questionIds, quizId, userId) {
    let query = `SELECT qr.id, qr.title, qr.question, qr.correct_msg, qr.answer_type, qp.post_id AS postId, qt.user_id, qt.answer_data AS submitData, qn.notes, qn.question_id AS questionId, qn.idpsas_user_notes AS noteId, qn.note_meta, IFNULL(qm.question_id, -1) AS marked
                 FROM ${prefix.prefix}_learndash_pro_quiz_question qr
                 CROSS JOIN ${prefix.prefix}_postmeta qp
                 ON qr.ID = qp.meta_value
                 AND qp.meta_key = 'question_pro_id'
                 LEFT JOIN ${table.table}_quiz_reports qt
                 ON qp.post_id = qt.question_id
                 AND qt.user_id = '${userId}'
                 AND qt.quiz_id = '${quizId}'
                 LEFT JOIN ${table.table}_user_notes qn
                 ON qp.post_id = qn.question_id
                 AND qn.user_id = '${userId}'
                 AND qn.quiz_id = '${quizId}'
                 LEFT JOIN ${table.table}_user_marked_questions qm
                 ON qp.post_id = qm.question_id
                 AND qm.user_id = '${userId}'
                 WHERE qp.post_id IN (${questionIds})`;
                 console.log(query)
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Add Percentage Others //
function addPercentageOthers(questionId, obj) {
    let query = `INSERT INTO ${table.table}_percentage_others (question_id, options) VALUES (${questionId}, '${JSON.stringify(obj)}')`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Update Percentage Others //
function updatePercentageOthers(questionId, obj) {
    let query = `UPDATE ${table.table}_percentage_others SET options = '${JSON.stringify(obj)}' WHERE question_id = ${questionId}`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Returns Percentage Others //
function getPercentageOthers(questionId) {
    let query = `SELECT * FROM ${table.table}_percentage_others WHERE question_id = ${questionId}`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

module.exports = { QuizSolver, markQuestion, saveAnswerToSuspendedStats, saveAnswerToQuizReports, deleteQuizReports, deleteSuspendedStats,
                   updateNewQuiz, fetchPreviousQuizzes, getDetailsOfQuestion, addPercentageOthers, updatePercentageOthers, getPercentageOthers }