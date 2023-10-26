const QuizNotes = require('../services/quiz-notes.service');

exports.addNotes = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizNotes.addNotes(req.body.data, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Adding Notes'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.getNotes = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizNotes.getNotes(req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Notes'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.getQuizNotes = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizNotes.getQuizNotes(req.body.quizId, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Quiz Notes'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.editNotes = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizNotes.editNotes(req.body.note, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Editing Notes'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.deleteNotes = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizNotes.deleteNotes(req.body.noteId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Deleting Notes'});
        }
        else {
            res.json({data: data})
        }
    })
}