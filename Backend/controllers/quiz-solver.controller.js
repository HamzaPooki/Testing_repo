const QuizSolver = require('../services/quiz-solver.service');

exports.markQuestion = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizSolver.markQuestion(req.body.data, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Marking Question'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.submitAnswer = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizSolver.submitAnswer(req.body.data, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Submitting Answer'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.saveQuiz = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizSolver.saveQuiz(req.body.data, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Saving Quiz'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.getPercentageOthers = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizSolver.getPercentageOthers(req.body.questionId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Percentage Others'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.resumeQuiz = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizSolver.resumeQuiz(req.body.quizId, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Resuming Quiz'});
        }
        else {
            res.json({data: data})
        }
    })
}