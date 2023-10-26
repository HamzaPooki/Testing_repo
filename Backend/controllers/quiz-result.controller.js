const QuizResult = require('../services/quiz-result.service');

exports.getQuizResults = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizResult.getQuizResults(req.body.quizId, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Quiz Results'});
        }
        else {
            res.json({data: data})
        }
    })
}