const QuizFeedbacks = require('../services/quiz-feedbacks.service');

exports.addFeedbacks = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizFeedbacks.addFeedbacks(req.body.data, req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Adding Feedbacks'});
        }
        else {
            res.json({data: data})
        }
    })
}