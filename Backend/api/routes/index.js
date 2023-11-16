var express = require('express');
var router = express.Router();
var cors = require('cors');
var path = require('path')

router.use(cors({credentials:true , origin: 'http://localhost:4200' }));

// Middlewares //

const middleware = require('../middlewares/middleware');

// Controllers //

const auth = require('../../controllers/authentication.controller');
const user = require('../../controllers/user.controller');
const quizGenerator = require('../../controllers/quiz-generator.controller');
const quizSolver = require('../../controllers/quiz-solver.controller');
const quizResult = require('../../controllers/quiz-result.controller');
const quizAnalysis = require('../../controllers/quiz-analysis.controller');
const quizNotes = require('../../controllers/quiz-notes.controller');
const quizFeedbacks = require('../../controllers/quiz-feedbacks.controller');
const quizPerformance = require('../../controllers/quiz-performance.controller');

// Modules //

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/// ---------- Authentication Module ---------- ///

// User Login //

router.post('/auth/login', auth.login);

// User Two Factor Authentication //

router.post('/auth/twoFactorAuthentication', auth.twoFactorAuthentication);

/// ------------------------------------------- ///


/// ---------- User Module ---------- ///

// Get Dashboard Stats //

router.get('/user/getDashboardStats', middleware.checkToken, user.getDashboardStats);

// Reset Stats //

router.get('/user/resetStats', middleware.checkToken, user.resetStats);

// Get User Profile //

router.get('/user/getUserProfile', middleware.checkToken, user.getUserProfile);

/// ------------------------------------------- ///


/// ---------- Quiz Generator Module ---------- ///

// Get All Categories //

router.get('/quiz/generator/getAllCategories', middleware.checkToken, quizGenerator.getAllCategories);

// Generate Quiz //

router.post('/quiz/generator/generateQuiz', middleware.checkToken, quizGenerator.generateQuiz);

// Get Previous Quizzes //

router.get('/quiz/generator/getPreviousQuizzes', middleware.checkToken, quizGenerator.getPreviousQuizzes);

// Get Question Counts //

router.post('/quiz/generator/getQuestionCounts', middleware.checkToken, quizGenerator.getQuestionCounts);

// Get Question Details //

router.post('/quiz/generator/getQuestionDetails', middleware.checkToken, quizGenerator.getQuestionDetails);

/// ------------------------------------------- ///


/// ---------- Quiz Solver Module ---------- ///

// Mark Question as Flagged or Not //

router.post('/quiz/solver/markQuestion', middleware.checkToken, quizSolver.markQuestion);

// Submit Answer (Submit Button) //

router.post('/quiz/solver/submitAnswer', middleware.checkToken, quizSolver.submitAnswer);

// Save Quiz (End or Suspend Button) //

router.post('/quiz/solver/saveQuiz', middleware.checkToken, quizSolver.saveQuiz);

// Get Percentage Others //

router.post('/quiz/solver/getPercentageOthers', middleware.checkToken, quizSolver.getPercentageOthers);

// Resume Quiz (Resume or Review Button) //

router.post('/quiz/solver/resumeQuiz', middleware.checkToken, quizSolver.resumeQuiz);

/// --------------------------------------- ///


/// ---------- Quiz Result Module ---------- ///

// Get Quiz Results //

router.post('/quiz/result/getQuizResults', middleware.checkToken, quizResult.getQuizResults);

/// ---------------------------------------- ///


/// ---------- Quiz Analysis Module ---------- ///

// Get Quiz Analysis //

router.post('/quiz/analysis/getQuizAnalysis', middleware.checkToken, quizAnalysis.getQuizAnalysis);

/// ---------------------------------------- ///


/// ---------- Quiz Notes Module ---------- ///

// Add Notes //

router.post('/quiz/notes/addNotes', middleware.checkToken, quizNotes.addNotes);

// Get Notes //

router.get('/quiz/notes/getNotes', middleware.checkToken, quizNotes.getNotes);

// Get Quiz Notes //

router.post('/quiz/notes/getQuizNotes', middleware.checkToken, quizNotes.getQuizNotes);

// Edit Notes //

router.post('/quiz/notes/editNotes', middleware.checkToken, quizNotes.editNotes);

// Delete Notes //

router.post('/quiz/notes/deleteNotes', middleware.checkToken, quizNotes.deleteNotes);

/// --------------------------------------- ///


/// ---------- Quiz Feedbacks Module ---------- ///

// Add Feedbacks //

router.post('/quiz/feedbacks/addFeedbacks', middleware.checkToken, quizFeedbacks.addFeedbacks);

/// ------------------------------------------- ///


/// ---------- Quiz Performance Module ---------- ///

// Get Performance Stats //

router.get('/quiz/performance/getPerformanceStats', middleware.checkToken, quizPerformance.getPerformanceStats);

// Get Performance Graphs //

router.get('/quiz/performance/getPerformanceGraphs', middleware.checkToken, quizPerformance.getPerformanceGraphs);

/// --------------------------------------------- ///


// AngularJS Path Routing //

router.use('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// ----------------------- //

module.exports = router;


