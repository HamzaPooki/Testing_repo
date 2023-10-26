const { QuizResult, getQuizStats, getQuestionStats, getQuizResults } = require('../models/quiz-result.model');

QuizResult.getQuizResults = async (quizId, userId, result) => {
    try {
        // Get Quiz Statistics //
        let score = 0, timeTaken = "", status = "", questions = [], totalQuestions = 0
        let quizQuery = await getQuizStats(quizId, userId)

        if (quizQuery.length > 0) {
            score = parseInt(quizQuery[0].quizScore)
            timeTaken = quizQuery[0].quizTime
            totalQuestions = parseInt(quizQuery[0].quizTotalQuestions)
            questions = JSON.parse(quizQuery[0].quizQuestions)
            status = quizQuery[0].quizStatus
        }
        else {
            result(null, {
                status: false, 
                message: "No Stats Available"
            })
            return;
        }

        // Get Quiz Questions Statistics //
        let totalCorrect = 0, totalIncorrect = 0, totalOmitted = 0, answeredQuestions = 0
        let questionQuery = await getQuestionStats(quizId, userId)
        answeredQuestions = questionQuery.length
        
        for (let i = 0; i < questionQuery.length; i++) {
            questionQuery[i] = JSON.parse(questionQuery[i].answer_data)
            if (questionQuery[i].correct === 1) {
                totalCorrect += 1
            }
            if (questionQuery[i].correct === 0) {
                totalIncorrect += 1
            }
            if (questionQuery[i].correct === -1) {
                totalOmitted += 1
            }
        }

        // Get Quiz Questions Result //
        let quizResults = []
        let resultQuery = await getQuizResults(quizId, userId, questions)
        for (let i = 0; i < resultQuery.length; i++) {
            quizResults.push({
                "QuestionID": resultQuery[i].QuestionID,
                "Subject": resultQuery[i].QSubject,
                "System": resultQuery[i].QSystem,
                "Topic": resultQuery[i].QTopic,
                "Status": parseInt(resultQuery[i].QuestionStatus),
                "AverageCorrectToOthers": 0
            })
        }
        result(null, {
            status: true, 
            quizId: quizId,
            score: score,
            timeTaken: timeTaken,
            status: status,
            totalQuestions: totalQuestions,
            answeredQuestions: answeredQuestions,
            totalCorrect: totalCorrect,
            totalIncorrect: totalIncorrect,
            totalOmitted: totalOmitted,
            quizResults: quizResults
        })
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

module.exports = QuizResult