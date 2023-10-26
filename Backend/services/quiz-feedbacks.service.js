const { QuizFeedbacks, addFeedbacks } = require('../models/quiz-feedbacks.model');

QuizFeedbacks.addFeedbacks = async (data, userId, result) => {
    try {
        let feedbackQuery = await addFeedbacks(data, userId);
        result(null, {status: true, message: "Feedback Added"});
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

module.exports = QuizFeedbacks