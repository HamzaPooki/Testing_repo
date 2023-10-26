const { QuizSolver, markQuestion, saveAnswerToSuspendedStats, saveAnswerToQuizReports, deleteQuizReports, deleteSuspendedStats, 
        updateNewQuiz, fetchPreviousQuizzes, getDetailsOfQuestion, addPercentageOthers, updatePercentageOthers, getPercentageOthers } = require('../models/quiz-solver.model');
const { getParsedOptions } = require('../models/quiz-generator.model');

// Mark Question Function //
QuizSolver.markQuestion = async (data, userId, result) => {
    try {
        let markQuery = await markQuestion(data, userId)
        if (markQuery.length !== 0) {
            result(null, {status: true, message: "Question Marked as Flagged"});
        }
        else {
            result(null, {status: false, message: "Already Marked or Doesn't Exist"});
        }
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

// Submit Answer Function //
QuizSolver.submitAnswer = async (data, userId, result) => {
    try {
        let selectedOptionsArray = []
        selectedOptionsArray.push(data.answerMeta)
        let quiz = {
            "quizId": data.quizId,
            "selectedOptionsArray": selectedOptionsArray
        }
        let suspendedStatsQuery = await saveAnswerToSuspendedStats(userId, quiz);
        let quizReportsQuery = await saveAnswerToQuizReports(userId, quiz);

        let option = data.answerMeta.optionIndexSelected
        if (option != -1) {
            let percentageQuery = await getPercentageOthers(data.questionId)
            if (percentageQuery.length > 0) {
                let obj = JSON.parse(percentageQuery[0].options)
                if (obj.hasOwnProperty(option.toString())) {
                    let count = obj[option]
                    count = count + 1
                    obj[option] = count
                }
                else {
                    obj[option] = 1
                }
                let optionQuery = await updatePercentageOthers(data.questionId, obj)
            }
            else {
                let obj = {};
                obj[option] = 1
                let optionQuery = await addPercentageOthers(data.questionId, obj)
            }
        }
        
        result(null, {status: true, message: "Answer Submitted"});
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

// Save Quiz Function //
QuizSolver.saveQuiz = async (data, userId, result) => {
    try {
        let quiz = {
            quizId: data.quiz.quizId,
            quizTitle: data.quiz.quizTitle,
            quizDate: data.quiz.quizDate,
            quizScore: data.quiz.quizScore,
            quizTotalQuestions: JSON.parse(data.quiz.quizQuestions).length,
            quizStatus: data.quiz.quizStatus,
            quizQuestions: (data.quiz.quizQuestions),
            quizMode:data.quiz.quizMode,
            quizTime: data.quiz.quizTime,
            isTimed: data.quiz.isTimed,
            omittedQuestions: data.quiz.omittedQuestions,
            selectedOptionsArray: data.quiz.SelectedOptionsArray,
            currentIndex: data.quiz.currentIndex
        };
    
        if (data.quiz.quizMode === 'exam') {
            let quizReportsQuery = await deleteQuizReports(data, userId)
            let suspendedStatsQuery = await deleteSuspendedStats(data, userId)
        }

        let query;
        query = await updateNewQuiz(quiz, userId);
        if (quiz.quizStatus !== 'suspended') {
            quiz.selectedOptionsArray = quiz.selectedOptionsArray.concat(quiz.omittedQuestions)
            if (quiz.selectedOptionsArray.length > 0) {
                query = await saveAnswerToQuizReports(userId, quiz);
            }
            query = await deleteSuspendedStats(data, userId)
        }
        else {
            if (quiz.selectedOptionsArray.length > 0) {
                query = await saveAnswerToQuizReports(userId, quiz);
                query = await saveAnswerToSuspendedStats(userId, quiz);
            }
        }
        result(null, {status: true, message: "Quiz Updated"})
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

// Get Percentage Others Function //
QuizSolver.getPercentageOthers = async (questionId, result) => {
    try {
        let percentageQuery = await getPercentageOthers(questionId)
        if (percentageQuery.length > 0) {
            result(null, {
                status: true,
                questionId: questionId,
                options: JSON.parse(percentageQuery[0].options)
            })
        }
        else {
            result(null, {
                status: true,
                questionId: questionId,
                options: {'-1': 0}
            })
        }
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

// Resume Quiz Function //
QuizSolver.resumeQuiz = async (quizId, userId, result) =>  {
    try {
        let previousQuizzes = [];
        let questionPostIds = [], questions = []

        // Fetch Previous Quizzes For Suspended Questions //
        let previousQuizQuery = await fetchPreviousQuizzes(quizId, userId)
        previousQuizzes = previousQuizQuery

        if (previousQuizzes.length > 0) {

            previousQuizzes.forEach(r => {
                r.quiz_meta = JSON.parse(r.quiz_meta);
                JSON.parse(r.quiz_meta.quizQuestions).forEach(q => {
                    questionPostIds.push(q);
                })
            })

            // Returns Details of All Questions //
            questions = await getDetailsOfQuestion(questionPostIds, quizId, userId);

            // Sorting Questions For Options //
            questions.sort((a, b) => a.id - b.id)

            // Assigning Options to Questions //
            let questionIds = questions.map(item => item.id)
            let optionQuery = await getParsedOptions(questionIds)
            if (optionQuery.status) {
                let options = JSON.parse(optionQuery.data);
                for (let i = 0; i < questions.length; i++) {
                    questions[i].options = [];
                    questions[i].statistics = [];
                    let optionSingle = JSON.parse(options[i]);
                    optionSingle.forEach(op => {
                        questions[i].options.push(op.options);
                        questions[i].statistics.push(op.is_Correct ? 1 : 0);
                    })
                }
            }

            // Assigning PostIDs to Question IDs //
            questions.forEach(q => {
                questions.forEach(r => {
                    if(r.postId === q.postId) {
                        q.id = r.postId;
                    }
                })
            })

            // Sorting Questions in Ascending Order //
            questions.sort((a, b) => a.postId - b.postId)
            
            result(null, {
                status: true,
                questions, 
                previousQuizzes
            })
        }
        else {
            result(null, {
                status: true,
                questions, 
                previousQuizzes
            })
        }
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

module.exports = QuizSolver