const { User, getTotalQuestionsCount, getQuizStats, getQuestionStats, deleteQuizzes, deleteQuizReports, deleteSuspendedStats,
        deleteUserNotes, deleteMarkedQuestions, getUserProfile } = require('../models/user.model');

User.getDashboardStats = async (userId, result) => {
    try {
        // Get Total Questions Count //
        let totalQuestions = 0
        let countQuery = await getTotalQuestionsCount()

        totalQuestions = countQuery[0].Total

        // Get User Quizzes Statistics //
        let totalQuizzes = 0, completedQuizzes = 0, suspendedQuizzes = 0
        let percentageScore = 0, allQuizScores = [], questions = []
        let quizQuery = await getQuizStats(userId)

        totalQuizzes = quizQuery.length
        for (let i = 0; i < quizQuery.length; i++) {
            percentageScore = (quizQuery[i].quizScore / quizQuery[i].quizTotalQuestions) * 100
            allQuizScores.push({
                "ID": quizQuery[i].quizId,
                "Score": percentageScore
            })

            if (quizQuery[i].quizStatus === 'completed') {
                completedQuizzes += 1
            }
            if (quizQuery[i].quizStatus === 'suspended') {
                suspendedQuizzes += 1
            }
            questions = JSON.parse(quizQuery[i].quizQuestions)
        }

        // Get User Quiz Questions Statistics //
        let subjects = [], questionIDs = []
        let correctQuestions = 0, incorrectQuestions = 0, omittedQuestions = 0
        let usedQuestions = 0, unUsedQuestions = 0, answeredQuestions = 0

        if (questions.length > 0) {
            let questionQuery = await getQuestionStats(userId, questions) 
            answeredQuestions = questionQuery.length
            for (let i = 0; i < questionQuery.length; i++) {
                if (subjects.indexOf(questionQuery[i].QSubject) === -1) {
                    subjects.push(questionQuery[i].QSubject)
                }
                if (questionIDs.indexOf(questionQuery[i].QuestionID) === -1) {
                    questionIDs.push(questionQuery[i].QuestionID)
                }
                if (questionQuery[i].Answer == 1) {
                    correctQuestions += 1
                }
                if (questionQuery[i].Answer == 0) {
                    incorrectQuestions += 1
                }
                if (questionQuery[i].Answer == -1) {
                    omittedQuestions += 1
                }
            }
            usedQuestions = questionIDs.length
            unUsedQuestions = totalQuestions - usedQuestions  
        }

        // Get User Quizzes Best Subject and Worst Subject //
        let correct = 0, incorrect = 0, total = 0
        let allCategories = [], correctCategories = [], incorrectCategories = [], totalCategories = []
        let bestSubject = "None", worstSubject = "None"

        if (answeredQuestions.length > 0) {
            for (let i = 0; i < subjects.length; i++) {
                for (let j = 0; j < questionQuery.length; j++) {
                    if (subjects[i] === questionQuery[j].QSubject) {
                        if (questionQuery[j].Answer == 1) {
                            correct += 1;
                        }
                        if (questionQuery[j].Answer == 0) {
                            incorrect += 1;
                        }
                        total += 1;
                    }
                }
                allCategories.push(subjects[i])
                correctCategories.push(correct)
                incorrectCategories.push(incorrect)
                totalCategories.push(total)
    
                correct = 0;
                incorrect = 0;
                total = 0;
            }
    
            let percentage = 0;
            for (let i = 0; i < totalCategories.length; i++) {
                percentage = (incorrectCategories[i] / totalCategories[i]) * 100
                incorrectCategories[i] = percentage
                percentage = (correctCategories[i] / totalCategories[i]) * 100
                correctCategories[i] = percentage
            }
            
            let indexMaxCorrect = correctCategories.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
            let indexMaxIncorrect = incorrectCategories.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    
            if (correctCategories[indexMaxCorrect] !== 0 && correctCategories.length > 0) {
                bestSubject = allCategories[indexMaxCorrect]            
            }
    
            if (incorrectCategories[indexMaxIncorrect] !== 0 && incorrectCategories.length > 0) {
                worstSubject = allCategories[indexMaxIncorrect]            
            }
        }

        result(null, {
            status: true,
            totalQuestions: totalQuestions,
            usedQuestions: usedQuestions,
            unUsedQuestions: unUsedQuestions,
            totalQuizzes: totalQuizzes,
            completedQuizzes: completedQuizzes,
            suspendedQuizzes: suspendedQuizzes,
            answeredQuestions: answeredQuestions,
            correctQuestions: correctQuestions,
            incorrectQuestions: incorrectQuestions,
            omittedQuestions: omittedQuestions,
            bestSubject: bestSubject,
            worstSubject: worstSubject,
            allQuizScores: allQuizScores
        })
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}


User.resetStats = async (userId, result) => {
    try {
        await deleteQuizzes(userId)
        await deleteQuizReports(userId)
        await deleteSuspendedStats(userId)
        await deleteUserNotes(userId)
        await deleteMarkedQuestions(userId)
        result(null, {status: true, message: "Stats Resetted"})
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

User.getUserProfile = async (userId, result) => {
    try {
        let userQuery = await getUserProfile(userId)
        if (userQuery.length > 0) {
            result(null, {status: true, user: userQuery[0]})
        }
        else {
            result(null, {status: true, user: null, message: "User Not Found"})
        }
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

module.exports = User