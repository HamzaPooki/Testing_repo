const QuizPerformance = require('../services/quiz-performance.service');

exports.getPerformanceStats = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizPerformance.getPerformanceStats(req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Performance Stats'});
        }
        else {
            res.json({data: data})
        }
    })
}

exports.getPerformanceGraphs = (req, res) => {
    if(!req.body) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }
    QuizPerformance.getPerformanceGraphs(req.body.userId, (err, data) => {
        if(err) {
            res.json({error: err, message: 'Error Returning Performance Graphs'});
        }
        else {
            res.json({data: data})
        }
    })
}