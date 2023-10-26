const QuizAnalysis = require('../services/quiz-analysis.service');

exports.getQuizAnalysis = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizAnalysis.getQuizAnalysis(req.body.quizId, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Quiz Analysis'});
        }
        else {
            res.json({data: data})
        }
    })
}