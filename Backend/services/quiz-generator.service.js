const { QuizGenerator, getDetailsOfQuestion, getAllUsedQuestions, getAllFlaggedQuestions, generateAndSaveQuiz, generateUniqueIndexes, 
        getAllQuizzesData, getAllCategoriesQuestions, getSuspendedQuestions, getPercentageOthers, getParsedOptions } = require('../models/quiz-generator.model')

// Get All Categories Function //
QuizGenerator.getAllCategories = async (userId, result) => {
    try {
        let subjects = []
        let systems = []
        let topics = []
        let questionIDs = [];
        let suspendedQuestions = []
        let categories = []

        // Get Suspended Questions //
        let suspendedQuery = await getSuspendedQuestions(userId)
        if (suspendedQuery.length > 0) {
            let parser;
            for (let i = 0; i < suspendedQuery.length; i++) {
                parser = JSON.parse(suspendedQuery[i].questions)
                for (let j = 0; j < parser.length; j++) {
                    suspendedQuestions.push(parser[j])
                }
            }
        }
        else {
            suspendedQuestions.push(-1)
        }

        // Get All Categories Questions //
        let questionsQuery = await getAllCategoriesQuestions(suspendedQuestions)

        // Saving Count of Question IDs and Categories //
        questionIDs = questionsQuery.map(item => item.QuestionID)

        for (let i = 0; i < questionsQuery.length; i++) {
            if (questionsQuery[i].SubjectID != null) {
                if (subjects.map(item => item.ID).indexOf(questionsQuery[i].SubjectID) == -1) {
                    subjects.push({
                        "ID": questionsQuery[i].SubjectID,
                        "Title": questionsQuery[i].SubjectTitle,
                        "Questions": questionsQuery.filter(item => item.SubjectID == questionsQuery[i].SubjectID).length
                    })
                }
            }
            if (questionsQuery[i].SystemID != null) {
                if (systems.map(item => item.ID).indexOf(questionsQuery[i].SystemID) == -1) {
                    systems.push({
                        "ID": questionsQuery[i].SystemID,
                        "Title": questionsQuery[i].SystemTitle,
                        "Questions": 0
                    })
                }
            }
            if (questionsQuery[i].TopicID != null) {
                if (topics.map(item => item.ID).indexOf(questionsQuery[i].TopicID) == -1) {
                    topics.push({
                        "ID": questionsQuery[i].TopicID,
                        "Title": questionsQuery[i].TopicTitle,
                        "Questions": 0
                    })
                }
            }   
        }

        // Sorting Categories with respect to Title //
        subjects.sort((a, b) => a.Title.localeCompare(b.Title))
        systems.sort((a, b) => a.Title.localeCompare(b.Title))
        topics.sort((a, b) => a.Title.localeCompare(b.Title))

        categories = [
            { parentCategory : 'subjects', subCategories: subjects },
            { parentCategory : 'systems', subCategories: systems },
            { parentCategory : 'topics', subCategories: topics },
        ];

        result(null, {
            status: true, 
            categories,
            totalQuestions: questionIDs.length, 
            questions: questionIDs
        });
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

// Generate Quiz Function //
QuizGenerator.generateQuiz = async (data, userId, result) => {
    try {
        let questionsPostIds = data.questionIds
        let questions = []
        let count = data.count
            
        // Returns Details of All Questions //
        questions = await getDetailsOfQuestion(questionsPostIds);

        let returnQuestions = [];
        let indexes = [];
        
        // Generate Unique Question Indexes //
        indexes = generateUniqueIndexes(count, questions.length);

        for (let i = 0; i < count; i++) {
            if (questions[indexes[i]] !== null) {
                returnQuestions.push(questions[indexes[i]]);
            }
        }

        // Sorting Questions For Options //
        returnQuestions.sort((a, b) => a.id - b.id)

        // Assigning Options to Questions //
        let questionIds = returnQuestions.map(item => item.id)
        let optionQuery = await getParsedOptions(questionIds)
        if (optionQuery.status) {
            let options = JSON.parse(optionQuery.data);
            for (let i = 0; i < returnQuestions.length; i++) {
                returnQuestions[i].options = [];
                returnQuestions[i].statistics = [];
                let optionSingle = JSON.parse(options[i]);
                optionSingle.forEach(op => {
                    returnQuestions[i].options.push(op.options);
                    returnQuestions[i].statistics.push(op.is_Correct ? 1 : 0);
                })
            }
        }

        // Assigning PostIDs to Question IDs //
        returnQuestions.forEach(q => {
            returnQuestions.forEach(r => {
                if(r.postId === q.postId) {
                    q.id = r.postId;
                }
            })
        })

        // Sorting Questions in Ascending Order //
        returnQuestions.sort((a, b) => a.postId - b.postId)
        
        // Generate And Save Quiz //
        const quizIdObj = await generateAndSaveQuiz(userId, returnQuestions);
        
        result(null, {
            status: true,
            questions: returnQuestions, 
            totalQuestions: returnQuestions.length, 
            quizId: quizIdObj.quizId
        })
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

// Get Previous Quizzes Function //
QuizGenerator.getPreviousQuizzes = async (userId, result) => {
    try {
        let quizzes = await getAllQuizzesData(userId)

        result(null, {
            status: true, 
            quizzes: quizzes
        })
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

// Get Question Counts Function //
QuizGenerator.getQuestionCounts = async (data, userId, result) =>  {
    try {    
        let allSubjects = []
        let allSystems = []
        let allTopics = []

        let subjects = []
        let systems = []
        let topics = []

        let suspendedQuestions = []
        
        let difficultyLevels = data.difficultyLevels
        let statusLevels = data.statusLevels

        let categories = []
        let questionsPostIds = []

        // Get Suspended Questions //
        let suspendedQuery = await getSuspendedQuestions(userId)
        if (suspendedQuery.length > 0) {
            let parser;
            for (let i = 0; i < suspendedQuery.length; i++) {
                parser = JSON.parse(suspendedQuery[i].questions)
                for (let j = 0; j < parser.length; j++) {
                    suspendedQuestions.push(parser[j])
                }
            }
        }
        else {
            suspendedQuestions.push(-1)
        }

        // Get All Categories Questions //
        let questionsQuery = await getAllCategoriesQuestions(suspendedQuestions)

        // Saving Count of Question IDs //
        questionsPostIds = questionsQuery.map(item => item.QuestionID)

        // Get Difficulty Levels // 

        if (difficultyLevels.length > 0 && questionsPostIds.length > 0) {
            let difficultyQuestions = [], meta, metaPercentage, percentage
            for (let i = 0; i < questionsPostIds.length; i++) {
                difficultyQuestions.push({"ID": questionsPostIds[i], "Percentage": -1})
            }
            let percentageQuery = await getPercentageOthers(questionsPostIds);
            for (let i = 0; i < percentageQuery.length; i++) {
                meta = JSON.parse(percentageQuery[i].answer_data)
                metaPercentage = JSON.parse(percentageQuery[i].options)
                let keys = Object.keys(metaPercentage);
                let CorrectHits = 0;
                let sum = 0;
                for (let k = 0; k < keys.length; k++){
                    if (parseInt(keys[k]) === meta.Correctanswerindex){
                        CorrectHits = metaPercentage[keys[k]]
                    }
                    sum += metaPercentage[keys[k]]
                }
                percentage = ((CorrectHits / sum) * 100).toFixed(1);
                for (let k = 0; k < difficultyQuestions.length; k++) {
                    if (difficultyQuestions[k].ID === percentageQuery[i].question_id) {
                        difficultyQuestions[k].Percentage = parseFloat(percentage)
                    }
                }
            }

            let counter = 0;
            let newPostIDs = [];

            for (let z = 0; z < difficultyLevels.length; z++) {
                if (difficultyLevels[z] === 1) {
                    for (let i = 0; i < difficultyQuestions.length; i++) {
                        if (difficultyQuestions[i].Percentage > 80 && difficultyQuestions[i].Percentage <= 100) {
                            counter = counter + 1
                            newPostIDs.push(difficultyQuestions[i].ID)
                        }
                    }
                }

                if (difficultyLevels[z] === 2) {
                    for (let i = 0; i < difficultyQuestions.length; i++) {
                        if (difficultyQuestions[i].Percentage > 60 && difficultyQuestions[i].Percentage <= 80) {
                            counter = counter + 1
                            newPostIDs.push(difficultyQuestions[i].ID)
                        }
                    }
                }
                
                if (difficultyLevels[z] === 3) {
                    for (let i = 0; i < difficultyQuestions.length; i++) {
                        if (difficultyQuestions[i].Percentage > 40 && difficultyQuestions[i].Percentage <= 60) {
                            counter = counter + 1
                            newPostIDs.push(difficultyQuestions[i].ID)
                        }
                    }
                }

                if (difficultyLevels[z] === 4) {
                    for (let i = 0; i < difficultyQuestions.length; i++) {
                        if (difficultyQuestions[i].Percentage > 20 && difficultyQuestions[i].Percentage <= 40) {
                            counter = counter + 1
                            newPostIDs.push(difficultyQuestions[i].ID)
                        }
                    }
                }

                if (difficultyLevels[z] === 5) {
                    for (let i = 0; i < difficultyQuestions.length; i++) {
                        if (difficultyQuestions[i].Percentage >= 0 && difficultyQuestions[i].Percentage <= 20) {
                            counter = counter + 1
                            newPostIDs.push(difficultyQuestions[i].ID)
                        }
                    }
                }
            }

            if (counter === 0) {
                questionsPostIds = []
            }
            else {
                questionsPostIds = newPostIDs
            }
        }

        // Get Status Levels //

        let filterQuery;
        let tempQuestions = []

        if (questionsPostIds.length > 0) {
            // 1 for Unused Questions //
            if (statusLevels == 1) {
                filterQuery = await getAllUsedQuestions(userId, questionsPostIds);

                // Unused Questions Filtering //
                if (filterQuery.length > 0) {
                    let allReports = []
                    for (let i = 0; i < filterQuery.length; i++) {
                        if (allReports.map(function(e) { return e.question_id; }).indexOf(filterQuery[i].question_id) == -1) {
                            allReports.push(filterQuery[i])
                        }
                    }
                    filterQuery = allReports
                    filterQuery.forEach(s => {
                        questionsPostIds = questionsPostIds.filter(item => item !== s.question_id)
                    })
                }
                if (questionsPostIds.length === 0) {
                    questionsPostIds = []
                }
            }

            // 2 for Incorrect Questions //
            if (statusLevels == 2) {
                filterQuery = await getAllUsedQuestions(userId, questionsPostIds);

                // Incorrect Questions Filtering //
                if (filterQuery.length > 0) {
                    let allReports = []
                    for (let i = 0; i < filterQuery.length; i++) {
                        if (allReports.map(function(e) { return e.question_id; }).indexOf(filterQuery[i].question_id) == -1) {
                            allReports.push(filterQuery[i])
                        }
                    }
                    filterQuery = allReports
                    filterQuery.forEach(r => {
                        let ans = JSON.parse(r.answer_data);
                        if(ans.correct === 0){
                            tempQuestions.push(r.question_id);
                        }
                    });
                }
                questionsPostIds = tempQuestions
                if (questionsPostIds.length === 0){
                    questionsPostIds = []
                }
            }

            // 3 for Correct Questions //
            if (statusLevels == 3) {
                filterQuery = await getAllUsedQuestions(userId, questionsPostIds);

                // Correct Questions Filtering //
                if (filterQuery.length > 0) {
                    let allReports = []
                    for (let i = 0; i < filterQuery.length; i++) {
                        if (allReports.map(function(e) { return e.question_id; }).indexOf(filterQuery[i].question_id) == -1) {
                            allReports.push(filterQuery[i])
                        }
                    }
                    filterQuery = allReports
                    filterQuery.forEach(r => {
                        let ans = JSON.parse(r.answer_data);
                        if(ans.correct === 1){
                            tempQuestions.push(r.question_id);
                        }
                    });
                }
                questionsPostIds = tempQuestions
                if (questionsPostIds.length === 0){
                    questionsPostIds = []
                }
            }

            // 4 for Omitted Questions //
            if (statusLevels == 4) {
                filterQuery = await getAllUsedQuestions(userId, questionsPostIds);
                
                // Omitted Questions Filtering //
                if (filterQuery.length > 0) {
                    let allReports = []
                    for (let i = 0; i < filterQuery.length; i++) {
                        if (allReports.map(function(e) { return e.question_id; }).indexOf(filterQuery[i].question_id) == -1) {
                            allReports.push(filterQuery[i])
                        }
                    }
                    filterQuery = allReports
                    filterQuery.forEach(r => {
                        let ans = JSON.parse(r.answer_data);
                        if(ans.correct === -1){
                            tempQuestions.push(r.question_id);
                        }
                    });
                }
                questionsPostIds = tempQuestions
                if (questionsPostIds.length === 0){
                    questionsPostIds = []
                }
            }

            // 5 for Flagged Questions //
            if (statusLevels == 5) {
                filterQuery = await getAllFlaggedQuestions(userId, questionsPostIds);

                // Flagged Questions Filtering //
                if(filterQuery.length > 0){
                    filterQuery.forEach(r => {
                        tempQuestions.push(r.question_id);
                    });
                }
                questionsPostIds = tempQuestions
                if (questionsPostIds.length === 0){
                    questionsPostIds = []
                }
            }
        }

        // Saving Count of Category Questions //

        let finalCategories = []

        for (let i = 0; i < questionsPostIds.length; i++) {
            finalCategories.push(questionsQuery.filter(item => item.QuestionID == questionsPostIds[i])[0])
        }

        questionsQuery = finalCategories

        for (let i = 0; i < questionsQuery.length; i++) {
            if (questionsQuery[i].SubjectID != null) {
                if (subjects.map(item => item.ID).indexOf(questionsQuery[i].SubjectID) == -1) {
                    subjects.push({
                        "ID": questionsQuery[i].SubjectID,
                        "Title": questionsQuery[i].SubjectTitle,
                        "Questions": questionsQuery.filter(item => item.SubjectID == questionsQuery[i].SubjectID).length
                    })
                }
            }
            if (questionsQuery[i].SystemID != null) {
                if (systems.map(item => item.ID).indexOf(questionsQuery[i].SystemID) == -1) {
                    systems.push({
                        "ID": questionsQuery[i].SystemID,
                        "Title": questionsQuery[i].SystemTitle,
                        "Questions": 0
                    })
                }
            }
            if (questionsQuery[i].TopicID != null) {
                if (topics.map(item => item.ID).indexOf(questionsQuery[i].TopicID) == -1) {
                    topics.push({
                        "ID": questionsQuery[i].TopicID,
                        "Title": questionsQuery[i].TopicTitle,
                        "Questions": 0
                    })
                }
            }   
        }

        for (let i = 0; i < data.subjects.length; i++) {
            allSubjects = [...allSubjects, ...questionsQuery.filter(item => item.SubjectTitle == data.subjects[i])]
        }

        for (let i = 0; i < data.systems.length; i++) {
            allSystems = [...allSystems, ...allSubjects.filter(item => item.SystemTitle == data.systems[i])]
        }

        for (let i = 0; i < data.topics.length; i++) {
            allTopics = [...allTopics, ...allSystems.filter(item => item.TopicTitle == data.topics[i])]
        }

        // Selecting Subjects //
        if (data.subjects.length > 0 && data.systems.length <= 0 && data.topics.length <= 0) {
            questionsPostIds = allSubjects.map(item => item.QuestionID)

            let total = 0
            for (let i = 0; i < systems.length; i++) {
                for (let j = 0; j < allSubjects.length; j++) {
                    if (systems[i].ID == allSubjects[j].SystemID) {
                        total += 1;
                    }
                }
                if (total === 0) {
                    systems[i].Questions = -1
                }
                else {
                    systems[i].Questions = total
                }
                total = 0;
            }
        }
        // Selecting Subjects and Systems //
        else if (data.subjects.length > 0 && data.systems.length > 0 && data.topics.length <= 0) {
            questionsPostIds = allSystems.map(item => item.QuestionID)

            let total = 0
            for (let i = 0; i < systems.length; i++) {
                for (let j = 0; j < allSubjects.length; j++) {
                    if (systems[i].ID == allSubjects[j].SystemID) {
                        total += 1;
                    }
                }
                if (total === 0) {
                    systems[i].Questions = -1
                }
                else {
                    systems[i].Questions = total
                }
                total = 0;
            }

            total = 0
            for (let i = 0; i < topics.length; i++) {
                for (let j = 0; j < allSystems.length; j++) {
                    if (topics[i].ID == allSystems[j].TopicID) {
                        total += 1;
                    }
                }
                if (total === 0) {
                    topics[i].Questions = -1
                }
                else {
                    topics[i].Questions = total
                }
                total = 0;
            }
        }
        // Selecting Subjects, Systems and Topics //
        else if (data.subjects.length > 0 && data.systems.length > 0 && data.topics.length > 0) {
            questionsPostIds = allTopics.map(item => item.QuestionID)

            let total = 0
            for (let i = 0; i < systems.length; i++) {
                for (let j = 0; j < allSubjects.length; j++) {
                    if (systems[i].ID == allSubjects[j].SystemID) {
                        total += 1;
                    }
                }
                if (total === 0) {
                    systems[i].Questions = -1
                }
                else {
                    systems[i].Questions = total
                }
                total = 0;
            }

            total = 0
            for (let i = 0; i < topics.length; i++) {
                for (let j = 0; j < allSystems.length; j++) {
                    if (topics[i].ID == allSystems[j].TopicID) {
                        total += 1;
                    }
                }
                if (total === 0) {
                    topics[i].Questions = -1
                }
                else {
                    topics[i].Questions = total
                }
                total = 0;
            }
        }

        // Sorting Categories with respect to Title //
        subjects.sort((a, b) => a.Title.localeCompare(b.Title))
        systems.sort((a, b) => a.Title.localeCompare(b.Title))
        topics.sort((a, b) => a.Title.localeCompare(b.Title))

        categories = [
            { parentCategory : 'subjects', subCategories: subjects },
            { parentCategory : 'systems', subCategories: systems },
            { parentCategory : 'topics', subCategories: topics },
        ];

        result(null, {
            status: true, 
            categories,
            totalQuestions: questionsPostIds.length, 
            questions: questionsPostIds
        });
    }
    catch (e) {
        result({e, status: false}, null)
    }
}

// Get Question Details Function //
QuizGenerator.getQuestionDetails = async (data, result) => {
    try {
        let questionsPostIds = data.questionIds
        let questions = []
            
        // Returns Details of All Questions //
        questions = await getDetailsOfQuestion(questionsPostIds);

        let returnQuestions = questions

        // Sorting Questions For Options //
        returnQuestions.sort((a, b) => a.id - b.id)

        // Assigning Options to Questions //
        let questionIds = returnQuestions.map(item => item.id)
        let optionQuery = await getParsedOptions(questionIds)
        if (optionQuery.status) {
            let options = JSON.parse(optionQuery.data);
            for (let i = 0; i < returnQuestions.length; i++) {
                returnQuestions[i].options = [];
                returnQuestions[i].statistics = [];
                let optionSingle = JSON.parse(options[i]);
                optionSingle.forEach(op => {
                    returnQuestions[i].options.push(op.options);
                    returnQuestions[i].statistics.push(op.is_Correct ? 1 : 0);
                })
            }
        }

        // Assigning PostIDs to Question IDs //
        returnQuestions.forEach(q => {
            returnQuestions.forEach(r => {
                if(r.postId === q.postId) {
                    q.id = r.postId;
                }
            })
        })

        // Sorting Questions in Ascending Order //
        returnQuestions.sort((a, b) => a.postId - b.postId)
        
        result(null, {
            status: true,
            questions: returnQuestions
        })
    }
    catch (e) {
        console.error(e)
        result({error: e, status: false}, null)
    }
}

module.exports = QuizGenerator