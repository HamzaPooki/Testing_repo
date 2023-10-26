const { QuizNotes, addNotes, getNotes, getQuizNotes, editNotes, deleteNotes } = require('../models/quiz-notes.model');

QuizNotes.addNotes = async (data, userId, result) => {
    try {
        let noteQuery = await addNotes(data, userId);
        result(null, {status: true, message: "Note Added"});
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

QuizNotes.getNotes = async (userId, result) =>  {
    try {
        let notes = []
        let noteQuery = await getNotes(userId)
        notes = noteQuery
        result(null, {
            status: true,
            notes: notes
        })
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

QuizNotes.getQuizNotes = async (quizId, userId, result) =>  {
    try {
        let noteQuery = await getQuizNotes(quizId, userId)
        result(null, {
            status: true,
            quizNotes: noteQuery
        })
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

QuizNotes.editNotes = async (note, result) =>  {
    try {
        let noteQuery = await editNotes(note)
        result(null, {
            status: true,
            message: "Note Edited"
        })
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

QuizNotes.deleteNotes = async (noteId, result) =>  {
    try {
        let noteQuery = await deleteNotes(noteId)
        result(null, {
            status: true,
            message: "Note Deleted"
        })
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

module.exports = QuizNotes