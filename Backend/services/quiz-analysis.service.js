
   
const { QuizAnalysis, getQuizAnalysis } = require('../models/quiz-analysis.model');
const { getQuizStats, getQuestionStats } = require('../models/quiz-result.model');

QuizAnalysis.getQuizAnalysis = async (quizId, userId, result) => {
    try {
        // Get Quiz Statistics //
        let timeTaken = "", questions = []
        let quizQuery = await getQuizStats(quizId, userId)

        if (quizQuery.length > 0) {
            timeTaken = quizQuery[0].quizTime
            questions = JSON.parse(quizQuery[0].quizQuestions)
        }
        else {
            result(null, {
                status: false, 
                message: "No Stats Available"
            })
            return;
        }

        // Get Quiz Questions Statistics //
        let totalQuestionsAnswered = 0, totalCorrect = 0, totalIncorrect = 0, totalOmitted = 0
        let correct_correct = 0, correct_incorrect = 0, incorrect_correct = 0, incorrect_incorrect = 0
        let questionQuery = await getQuestionStats(quizId, userId)
        
        totalQuestionsAnswered = questionQuery.length
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

            if (questionQuery[i].stat === 1) {
                correct_correct += 1
            }
            if (questionQuery[i].stat === 2) {
                correct_incorrect += 1
            }
            if (questionQuery[i].stat === 3) {
                incorrect_correct += 1
            }
            if (questionQuery[i].stat === 4) {
                incorrect_incorrect += 1
            }
        }

        // Get Quiz Analysis Based on Subjects, Systems and Topics //
        let subjects = [], systems = [], topics = []
        let allSubjects = [], allSystems = [], allTopics = []
        let singleSubjects = [], singleSystems = [], singleTopics = []
        let allAnswers = []
        let analysisQuery = await getQuizAnalysis(quizId, userId, questions)

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

        // Get Quiz Best Subject and Worst Subject //
        let allCategories = []
        let totalCategories = [], correctCategories = [], incorrectCategories = []
        let bestSubject = "None", worstSubject = "None"

        for (let i = 0; i < singleSubjects.length; i++) {
            for (let j = 0; j < analysisQuery.length; j++) {
                if (singleSubjects[i] === analysisQuery[j].QSubject) {
                    if (analysisQuery[j].Answer == 1) {
                        correct += 1;
                    }
                    if (analysisQuery[j].Answer == 0) {
                        incorrect += 1;
                    }
                    total += 1;
                }
            }
            allCategories.push(singleSubjects[i])
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

        result(null, {
            status: true,
            bestSubject: bestSubject,
            worstSubject, worstSubject,
            timeTaken: timeTaken,
            totalQuestionsAnswered: totalQuestionsAnswered,
            totalCorrect: totalCorrect,
            totalIncorrect: totalIncorrect,
            totalOmitted: totalOmitted,
            totalCorrectToCorrect: correct_correct,
            totalCorrectToIncorrect: correct_incorrect,
            totalIncorrectToCorrect: incorrect_correct,
            totalIncorrectToIncorrect: incorrect_incorrect,
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

module.exports = QuizAnalysis