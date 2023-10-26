
   
const { QuizPerformance, getPerformanceAnalysis, getOverallQuizStats, getPerformanceGraphs } = require('../models/quiz-performance.model');

QuizPerformance.getPerformanceStats = async (userId, result) => {
    try {
        // Get Overall Quiz Statistics //
        let totalQuizzes = 0, completedQuizzes = 0, suspendedQuizzes = 0, questions = []
        let quizQuery = await getOverallQuizStats(userId)

        if (quizQuery.length > 0) {
            totalQuizzes = quizQuery.length
            for (let i = 0; i < quizQuery.length; i++) {
                questions = [...questions, ...JSON.parse(quizQuery[i].Questions)]
                if (quizQuery[i].Status == 'suspended') {
                    suspendedQuizzes += 1
                }
                if (quizQuery[i].Status == 'completed') {
                    completedQuizzes += 1
                }
            }
        }
        else {
            result(null, {
                status: false, 
                message: "No Stats Available"
            })
            return;
        }

        // Get Performance Analysis Based on Subjects, Systems and Topics //
        let subjects = [], systems = [], topics = []
        let allSubjects = [], allSystems = [], allTopics = []
        let singleSubjects = [], singleSystems = [], singleTopics = []
        let allAnswers = []
        let analysisQuery = await getPerformanceAnalysis(userId, questions)

        for (let i = 0; i < analysisQuery.length; i++) {
            allSubjects.push(analysisQuery[i].QSubject)
            allSystems.push(analysisQuery[i].QSystem)
            allTopics.push(analysisQuery[i].QTopic)
            allAnswers.push(parseInt(analysisQuery[i].Answer))

            if (singleSubjects.indexOf(allSubjects[i]) == -1) {
                singleSubjects.push(allSubjects[i]);
            }
            if (singleSystems.indexOf(allSystems[i]) == -1) {
                singleSystems.push(allSystems[i]);
            }
            if (singleTopics.indexOf(allTopics[i]) == -1) {
                singleTopics.push(allTopics[i]);
            }
        }

        let total = 0
        let correct = 0, incorrect = 0, omitted = 0

        // Analysis By Subjects //

        for (let i = 0; i < singleSubjects.length; i++) {
            for (let j = 0; j < allSubjects.length; j++) {
                if (singleSubjects[i] === allSubjects[j]) {
                    total += 1;
                    if (allAnswers[j] === 1) {
                        correct += 1;
                    }
                    if (allAnswers[j] === 0) {
                        incorrect += 1;
                    }
                    if (allAnswers[j] === -1) {
                        omitted += 1;
                    }
                }
            }
            subjects.push({
                "SrNo": i + 1,
                "Category": singleSubjects[i], 
                "TotalQuestions": total, 
                "CorrectQuestions": correct,
                "IncorrectQuestions": incorrect,
                "OmittedQuestions": omitted,
            })

            total = 0
            correct = 0, incorrect = 0, omitted = 0
        }

        total = 0
        correct = 0, incorrect = 0, omitted = 0

        // Analysis By Systems //

        for (let i = 0; i < singleSystems.length; i++) {
            for (let j = 0; j < allSystems.length; j++) {
                if (singleSystems[i] === allSystems[j]) {
                    total += 1;
                    if (allAnswers[j] === 1) {
                        correct += 1;
                    }
                    if (allAnswers[j] === 0) {
                        incorrect += 1;
                    }
                    if (allAnswers[j] === -1) {
                        omitted += 1;
                    }
                }
            }
            systems.push({
                "SrNo": i + 1,
                "Category": singleSystems[i], 
                "TotalQuestions": total, 
                "CorrectQuestions": correct,
                "IncorrectQuestions": incorrect,
                "OmittedQuestions": omitted,
            })

            total = 0
            correct = 0, incorrect = 0, omitted = 0
        }

        total = 0
        correct = 0, incorrect = 0, omitted = 0

        // Analysis By Topics //

        for (let i = 0; i < singleTopics.length; i++) {
            for (let j = 0; j < allTopics.length; j++) {
                if (singleTopics[i] === allTopics[j]) {
                    total += 1;
                    if (allAnswers[j] === 1) {
                        correct += 1;
                    }
                    if (allAnswers[j] === 0) {
                        incorrect += 1;
                    }
                    if (allAnswers[j] === -1) {
                        omitted += 1;
                    }
                }
            }
            topics.push({
                "SrNo": i + 1,
                "Category": singleTopics[i], 
                "TotalQuestions": total, 
                "CorrectQuestions": correct,
                "IncorrectQuestions": incorrect,
                "OmittedQuestions": omitted,
            })

            total = 0
            correct = 0, incorrect = 0, omitted = 0
        }

        total = 0
        correct = 0, incorrect = 0, omitted = 0

        // Get User Best Subject, Worst Subject And Most Omitted Subject //
        let allCategories = []
        let totalCategories = [], correctCategories = [], incorrectCategories = [], omittedCategories = []
        let bestSubject = "None", worstSubject = "None", omittedSubject = "None"

        for (let i = 0; i < singleSubjects.length; i++) {
            for (let j = 0; j < analysisQuery.length; j++) {
                if (singleSubjects[i] === analysisQuery[j].QSubject) {
                    if (analysisQuery[j].Answer == 1) {
                        correct += 1;
                    }
                    if (analysisQuery[j].Answer == 0) {
                        incorrect += 1;
                    }
                    if (analysisQuery[j].Answer == -1) {
                        omitted += 1;
                    }
                    total += 1;
                }
            }
            allCategories.push(singleSubjects[i])
            correctCategories.push(correct)
            incorrectCategories.push(incorrect)
            omittedCategories.push(omitted)
            totalCategories.push(total)

            correct = 0;
            incorrect = 0;
            omitted = 0;
            total = 0;
        }

        let percentage = 0;
        for (let i = 0; i < totalCategories.length; i++) {
            percentage = (incorrectCategories[i] / totalCategories[i]) * 100
            incorrectCategories[i] = percentage
            percentage = (correctCategories[i] / totalCategories[i]) * 100
            correctCategories[i] = percentage
            percentage = (omittedCategories[i] / totalCategories[i]) * 100
            omittedCategories[i] = percentage
        }

        let indexMaxCorrect = correctCategories.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
        let indexMaxIncorrect = incorrectCategories.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
        let indexMaxOmitted = omittedCategories.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

        if (correctCategories[indexMaxCorrect] !== 0 && correctCategories.length > 0) {
            bestSubject = allCategories[indexMaxCorrect]            
        }

        if (incorrectCategories[indexMaxIncorrect] !== 0 && incorrectCategories.length > 0) {
            worstSubject = allCategories[indexMaxIncorrect]            
        }

        if (omittedCategories[indexMaxOmitted] !== 0 && omittedCategories.length > 0) {
            omittedSubject = allCategories[indexMaxOmitted]            
        }

        result(null, {
            status: true,
            bestSubject: bestSubject,
            worstSubject, worstSubject,
            omittedSubject: omittedSubject,
            totalQuizzes: totalQuizzes,
            completedQuizzes: completedQuizzes,
            suspendedQuizzes: suspendedQuizzes,
            subjects: subjects,
            systems: systems,
            topics: topics
        })
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

QuizPerformance.getPerformanceGraphs = async (userId, result) => {
    try {
        let quizGraphs = []
        let scorePercentage = 0
        let quizDate = ""

        let quizQuery = await getPerformanceGraphs(userId)

        for (let i = 0; i < quizQuery.length; i++) {
            scorePercentage = (quizQuery[i].QuizScore / quizQuery[i].QuizTotalQuestions) * 100

            quizDate = quizQuery[i].QuizDate.split(', ')
            quizDate = quizDate[0]

            quizGraphs.push({
                "ID": quizQuery[i].QuizID,
                "Date": quizDate,
                "Score": scorePercentage
            })
        }
    
        result(null, {status: true, quizzes: quizGraphs})
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

module.exports = QuizPerformance