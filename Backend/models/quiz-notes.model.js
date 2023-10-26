const sql = require("../services/db")
const config = require("config")
const prefix = config.get('User.prefixConfig')
const table = config.get('User.tableConfig')

const QuizNotes = function(quizNotes) {
    this.quizId = quizNotes.quizId
}

// Add Notes //
async function addNotes(data, userId) {
    const flag = await checkIfItemExists(data.questionId, data.quizId, userId, data.tableName);
    let query = '';

    let categoryQuery = await getNoteCategory(data.questionId)
    let noteMeta = {
        noteSubject: categoryQuery.filter(item => item.post_type === 'subjects').map(item => item.post_title)[0],
        noteSystem: categoryQuery.filter(item => item.post_type === 'systems').map(item => item.post_title)[0],
        noteTopic: categoryQuery.filter(item => item.post_type === 'topics').map(item => item.post_title)[0]
    }
    
    if (flag === 0) {
        query = `INSERT INTO ${table.table}_user_notes (question_id, user_id, quiz_id, notes, note_meta) VALUES ('${data.questionId}', '${userId}', '${data.quizId}', '${data.note}', '${JSON.stringify(noteMeta)}')`;
    }
    else {
        query = `UPDATE ${table.table}_user_notes SET notes = '${data.note}' WHERE user_id = '${userId}' AND question_id = '${data.questionId}' AND quiz_id = '${data.quizId}'`;
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

// Get Note Category //
function getNoteCategory(questionId) {
    let query = `SELECT post_title, post_type FROM ${prefix.prefix}_posts WHERE ID IN (SELECT meta_value FROM ${prefix.prefix}_postmeta WHERE post_id = '${questionId}');`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Get Notes //
function getNotes(userId) {
    let query = `SELECT * FROM ${table.table}_user_notes WHERE user_id = '${userId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Get Quiz Notes //
function getQuizNotes(quizId, userId) {
    let query = `SELECT * FROM ${table.table}_user_notes WHERE user_id = '${userId}' AND quiz_id = '${quizId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Edit Notes //
function editNotes(note) {
    let query = `UPDATE ${table.table}_user_notes SET notes = '${note.description}' WHERE id${table.table}_user_notes = '${note.noteId}'`;
    return new Promise((resolve, reject) => {
        sql.query(query, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
}

// Delete Notes //
function deleteNotes(noteId) {
    let query = `DELETE FROM ${table.table}_user_notes WHERE id${table.table}_user_notes = '${noteId}'`;
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

module.exports = { QuizNotes, addNotes, getNotes, getQuizNotes, editNotes, deleteNotes }