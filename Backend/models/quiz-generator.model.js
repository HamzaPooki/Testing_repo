const sql = require("../services/db")
const config = require("config")
const prefix = config.get('User.prefixConfig')
const table = config.get('User.tableConfig')
const wordPress = config.get('User.wordPressConfig')
const https = require('https')

const QuizGenerator = function(quizGenerator) {
    this.quizId = quizGenerator.quizId
}

// Returns Details of All Questions //
function getDetailsOfQuestion(questionIds) {
    let query = `SELECT qr.id, qr.title, qr.question, qr.correct_msg, qr.answer_type, qp.post_id as postId
                 FROM ${prefix.prefix}_learndash_pro_quiz_question qr
                 CROSS JOIN ${prefix.prefix}_postmeta qp
                 ON qr.ID = qp.meta_value
                 AND qp.meta_key = 'question_pro_id'
                 AND qp.post_id IN (${questionIds})`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Returns All Used Questions //
function getAllUsedQuestions(userId, questionIds) {
    let query = `SELECT * FROM ${table.table}_quiz_reports WHERE user_id = '${userId}' AND question_id IN (${questionIds}) ORDER BY idpsas_quiz_reports DESC`
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Returns All Flagged Questions //
function getAllFlaggedQuestions(userId, questionIds) {
    let query = `SELECT * FROM ${table.table}_user_marked_questions WHERE user_id = '${userId}' AND question_id IN (${questionIds})`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Generate And Save Quiz //
async function generateAndSaveQuiz(userId, questions) {
    const quizId = await generateQuizId();
    if (questions.length > 0) {
        let quiz = {
            quizId: quizId,
            quizTitle: 'Custom Quiz ' + quizId,
            quizDate: new Date(),
            quizScore: 0,
            quizTotalQuestions: questions.length,
            quizStatus: 'suspended',
            quizQuestions: JSON.stringify((questions.map(q => q.postId))?questions.map(q => q.postId):[]),
            quizMode: 'tutor',
            quizTime: '00:00:00',
            quizQuestionTypes: 'Multiple',
            isTimed: false
        };
        let query = `INSERT INTO ${table.table}_previous_quizzes (quiz_id, user_id, quiz_meta) VALUES ('${quizId}', '${userId}', '${JSON.stringify(quiz)}')`;
        return new Promise((resolve, reject) => {
            sql.query(query, (err, response) => {
                if (err) {
                    return reject(err);
                }
                resolve({status: true, quizId: quizId});
            });
        });
    }
    else {
        return new  Promise((resolve, reject) => {
            resolve({status: false});
        });
    }
}

// Generate Unique Quiz ID //
function generateQuizId() {
    let query = `SELECT MAX(quiz_id) as id FROM ${table.table}_previous_quizzes`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            else {
                let id = response[0].id;
                let quizId;
                if(id === null){
                    quizId = parseInt('387' + (++id) +'01');
                }
                else {
                    quizId = ++id;
                }
                resolve(quizId);
            }
        });
    });
}

// Generate Unique Question Indexes //
function generateUniqueIndexes(reqCount, totalQuestions){
    let arr = [];
    while(arr.length < reqCount){
        let r = Math.floor(Math.random() * totalQuestions);
        if(arr.indexOf(r) === -1) arr.push(r);
    }
    return arr;
}

// Get All Quizzes Data //
function getAllQuizzesData(userId) {
    query = `SELECT quiz_id as quizId, JSON_VALUE(quiz_meta, '$.quizTitle') as name, JSON_VALUE(quiz_meta, '$.quizScore') as score, JSON_VALUE(quiz_meta, '$.quizDate') as date, JSON_VALUE(quiz_meta, '$.quizStatus') as status, JSON_VALUE(quiz_meta, '$.quizQuestions') as questions, JSON_VALUE(quiz_meta, '$.quizTotalQuestions') as totalQuestions FROM ${table.table}_previous_quizzes WHERE user_id = '${userId}' ORDER BY sortId DESC`;
    return new Promise((resolve, reject) => {
        sql.query(query, async (err, response) => {
            if (err) {
                return reject(err);
            }
            for (const r of response) {
                r.questions = JSON.parse(r.questions)
                const categories = await getQuestionCategories(r.questions);
                r.subjects = categories.subjects;
                r.systems = categories.systems;
                r.topics = categories.topics;
            }
            resolve(response);
        });
    });
}

// Get Question Categories //
function getQuestionCategories(questionIds) {
    let query = `SELECT ID, post_title, post_type 
                 FROM ${prefix.prefix}_posts 
                 WHERE ID IN 
                 (SELECT meta_value FROM ${prefix.prefix}_postmeta 
                 WHERE post_id IN (${questionIds}) 
                 AND (meta_key = 'subject' OR meta_key = 'system' OR meta_key = 'topic'))`;
    return new Promise((resolve, reject) => {
        sql.query(query, async (err, response) => {
            if (err) {
                return reject(err);
            }
            else {
                resolve({
                    subjects: response.filter(s => s.post_type === 'subjects').map(i => i.post_title),
                    systems: response.filter(s => s.post_type === 'systems').map(i => i.post_title),
                    topics: response.filter(s => s.post_type === 'topics').map(i => i.post_title)
                })
            }
        });
    });
}

// Get All Categories Questions //
function getAllCategoriesQuestions(suspendedQuestions) {
    let query = `SELECT qp.post_id AS QuestionID, subID.meta_value AS SubjectID, subT.post_title AS SubjectTitle, sysID.meta_value AS SystemID, sysT.post_title AS SystemTitle, topID.meta_value AS TopicID, topT.post_title AS TopicTitle
                 FROM ${prefix.prefix}_learndash_pro_quiz_question qr
                 CROSS JOIN ${prefix.prefix}_postmeta qp
                 ON qr.ID = qp.meta_value
                 AND qp.meta_key = 'question_pro_id'
                 LEFT JOIN ${prefix.prefix}_postmeta subID
                 ON subID.post_id = qp.post_id
                 AND subID.meta_key = 'subject'
                 LEFT JOIN ${prefix.prefix}_postmeta sysID
                 ON sysID.post_id = qp.post_id
                 AND sysID.meta_key = 'system'
                 LEFT JOIN ${prefix.prefix}_postmeta topID
                 ON topID.post_id = qp.post_id
                 AND topID.meta_key = 'topic'
                 LEFT JOIN ${prefix.prefix}_posts subT
                 ON subID.meta_value = subT.ID
                 LEFT JOIN ${prefix.prefix}_posts sysT
                 ON sysID.meta_value = sysT.ID
                 LEFT JOIN ${prefix.prefix}_posts topT
                 ON topID.meta_value = topT.ID
                 WHERE qp.post_id NOT IN (${suspendedQuestions})`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Return All Suspended Questions //
function getSuspendedQuestions(userId) {
    let query = `SELECT json_value(quiz_meta, '$.quizQuestions') as questions FROM ${table.table}_previous_quizzes WHERE user_id = '${userId}' AND json_value(quiz_meta, '$.quizStatus') = 'suspended'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Return Percentage Others //
function getPercentageOthers(postIds) {
    let query = `SELECT a.question_id, a.answer_data, b.options
                 FROM ${table.table}_quiz_reports a, ${table.table}_percentage_others b
                 WHERE a.question_id = b.question_id
                 AND a.question_id IN (${postIds})`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if(err) return reject(err)
            resolve(response);
        })
    });
}

// Returns Parsed Options of Questions //
function getParsedOptions(questionIds) {
    return new Promise((resolve, reject) => {
        parseOptions(questionIds, (parsedOptions) => {
            resolve(parsedOptions);
        })
    });
}

// Returns Options of Questions (Wordpress API) //
function parseOptions(questionIds, callback) {
    https.get(''+ wordPress.wordPress +'/wp-json/parseOptions/v1/questions?Question_ID=['+ questionIds +']',(resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;

        });
        resp.on('end', () => {
            return callback({data, status: true});
        });
    }).on("error", (err) => {
        return({status: false});
    })
}

module.exports = { QuizGenerator, getDetailsOfQuestion, getAllUsedQuestions, getAllFlaggedQuestions, generateAndSaveQuiz, generateUniqueIndexes, 
                   getAllQuizzesData, getAllCategoriesQuestions, getSuspendedQuestions, getPercentageOthers, getParsedOptions }