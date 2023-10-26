const QuizGenerator = require('../services/quiz-generator.service');

exports.getAllCategories = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizGenerator.getAllCategories(req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Categories'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.generateQuiz = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizGenerator.generateQuiz(req.body.data, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Generating Quiz'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.getPreviousQuizzes = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizGenerator.getPreviousQuizzes(req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Previous Quizzes'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.getQuestionCounts = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizGenerator.getQuestionCounts(req.body.data, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Question Counts'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.getQuestionDetails = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizGenerator.getQuestionDetails(req.body.data, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Question Details'});
        }
        else {
            res.json({data: data})
        }
    })
}