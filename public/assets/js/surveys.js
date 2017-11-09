var showSurvey = false;
var questionNum = 0;

$('#showSurveyForm').click(function () {
    if (showSurvey) {
        $('#survey-form').hide();
        $('#showSurveyForm').text('Show Survey Form');
        showSurvey = false;
    } else {
        $('#survey-form').show();
        $('#showSurveyForm').text('Hide Survey Form');
        hideQuestionTypes();
        showSurvey = true;
    }
});

$('#addQuestion').click(function () {
    $('#multipleChoice').show();
    $('#ratingScale').show();
    $('#addQuestion').hide();
});

$('#addMultChoice').click(function () {
    hideQuestionTypes();
    var numAnswers = document.getElementById('multAnswers').value;
    if (numAnswers != '' && numAnswers != '0') {
        questionNum++;
        var questions = document.getElementById('questions');
        var formGroup = document.createElement('div');
        formGroup.setAttribute('class', 'form-group');
        var question = document.createElement('input');
        question.setAttribute('type', 'text');
        question.setAttribute('id', 'question' + questionNum);
        question.setAttribute('class', 'form-control');
        question.setAttribute('placeholder', 'Question');
        formGroup.appendChild(question);
        for (i = 1; i <= numAnswers; i++) {
            addAnswer(questionNum, formGroup, i);
        }
        question.setAttribute('name', numAnswers);
        questions.appendChild(formGroup);
    }
});

$('#addRatingScale').click(function () {
    hideQuestionTypes();
    var numAnswers = document.getElementById('ratingAnswers').value;
    if (numAnswers != '' && numAnswers != '0') {
        questionNum++;
        var questions = document.getElementById('questions');
        var formGroup = document.createElement('div');
        formGroup.setAttribute('class', 'form-group');
        var question = document.createElement('input');
        question.setAttribute('type', 'text');
        question.setAttribute('id', 'question' + questionNum);
        question.setAttribute('class', 'form-control');
        question.setAttribute('placeholder', 'Question');
        formGroup.appendChild(question);
        for (i = 1; i <= numAnswers; i++) {
            addAnswer(questionNum, formGroup, i);
        }
        question.setAttribute('name', numAnswers);
        questions.appendChild(formGroup);
    }
});

function addAnswer(questionNum, formGroup, answerNum) {
    var answer = document.createElement('input');
    answer.setAttribute('type', 'text');
    answer.setAttribute('id', questionNum + 'answer' + answerNum);
    answer.setAttribute('class', 'form-control');
    answer.setAttribute('placeholder', 'Answer');
    formGroup.appendChild(answer);
}

function hideQuestionTypes() {
    $('#multipleChoice').hide();
    $('#ratingScale').hide();
    $('#addQuestion').show();
}

$('#createSurvey').click(function () {
    // pull survey data from document
    var surveyName = document.getElementById('surveyName').value;
    var surveyType = 'none';
    var academic = document.getElementById('academic-radio');
    var personal = document.getElementById('personal-radio');
    var teamwork = document.getElementById('teamwork-radio');
    var other = document.getElementById('other-radio');
    if (academic.checked) {
        surveyType = 'academic';
    } else if (personal.checked) {
        surveyType = 'personal';
    } else if (teamwork.checked) {
        surveyType = 'teamwork';
    } else if (other.checked) {
        surveyType = 'other';
    }
    var surveyInstructor = document.getElementById('surveyInstructor').name;
    //var surveyCourse = document.getElementById('courses').value;
    var surveyCourse = $('#courses').val();
    var surveyDate = document.getElementById('datepicker').value;
    var questionIDs = {};

    // iterate and pull data from each question
    for (i = 1; i <= questionNum; i++) {
        var questionsRef = firebase.database().ref('questions');
        var questionID = questionsRef.push().key;
        var questionObj = document.getElementById('question' + i);
        var questions = {};
        questions['num'] = questionObj.name;
        questions['questionText'] = questionObj.value;
        var answers = {};
        for (j = 1; j <= questionObj.name; j++) {
            var answerObj = document.getElementById(i + 'answer' + j);
            answers['answer' + j] = answerObj.value;
        }
        questions['answers'] = answers;
        questionIDs[questionID] = 'true';
        questionsRef.child(questionID).update(questions);
    }

    // if survey data successfully pulled
    if (surveyName != '' && surveyType != '' && surveyCourse != '' && surveyDate != '') {
        // create valid survey object
        var surveysRef = firebase.database().ref('surveys');
        var surveyID = surveysRef.push().key;
        var surveyRef = firebase.database().ref('surveys/' + surveyID);

        // update survey in database
        surveyRef.set({
            name: surveyName,
            type: surveyType,
            instructor: surveyInstructor,
            date: surveyDate,
            questions: questionIDs
        });

        // update course in database
        var courseRef = firebase.database().ref('classes/' + surveyCourse + '/surveys/');
        var course = {};
        course[surveyCourse] = 'true';
        courseRef.update(course);
        location.reload();
    } else {
        console.log('Error accepting survey data, data is not valid.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var accountType = 'none';
    $('#survey-form').hide();
    $('#datepicker').datepicker();
    auth.onAuthStateChanged(function (user) {
        if (user) {
            var uid = user.uid;
            var accountRef = firebase.database().ref().child('users').child(uid);
            accountRef.on('value', function (snap) {
                accountType = (snap.val().accountType || 'none');
                if (accountType == 'instructor') {
                    $("#showSurveyForm").show();
                    populateSurveyForm(uid);
                } else if (accountType == 'student') {
                    $("#showSurveyForm").hide();
                }
            });
        }
    });
});

function populateSurveyForm(uid) {
    var coursesSelect = document.getElementById('courses');
    var coursesRef = firebase.database().ref('users/' + uid + '/classes');

    // iterate through each course in course list
    coursesRef.orderByKey().on('child_added', function (snapshot) {
        var courseID = snapshot.key;
        var courseRef = firebase.database().ref('classes/' + courseID);

        // pull course data and create option
        courseRef.on('value', function (snap) {
            var option = document.createElement('option');
            option.setAttribute('value', snap.key);
            var courseText = document.createTextNode(snap.val().className);
            option.appendChild(courseText);
            coursesSelect.appendChild(option);
        });
    });

    var surveyInstructor = document.getElementById('surveyInstructor');
    surveyInstructor.setAttribute('name', uid);
    instructorRef = firebase.database().ref('users/' + uid);
    instructorRef.on('value', function (snap) {
        surveyInstructor.setAttribute('value', snap.val().firstName + ' ' + snap.val().lastName);
    });
}

function loadSurveys() {
    var surveysTable = document.getElementById('surveys');
    var surveysRef = firebase.database().ref('users/' + uid + '/surveys');

    // iterate through user's groups
    surveysRef.orderByKey().on('child_added', function (snapshot) {
        var row = surveysTable.insertRow(groupsNum);
        var surveyID = snapshot.key;

        // iterate through each of the user's groups
        var surveyRef = firebase.database().ref().child('surveys').child(surveyID);
        surveyRef.orderByKey.on('child_added', function (snap) {
            var surveyName = row.insertCell(0);
            var surveyType = row.insertCell(1);
            var instructor = row.insertCell(2);
            var expirationDate = row.insertCell(3);

            // iterate through the group's data entries
            surveyRef.on('value', function (snap) {
                groupName = (snap.val().name || 'none');
                course = (snap.val().course || 'none');
                surveyType = (snap.val().surveyType || 'none');
                instructor = (snap.val().instructor || 'none');
                expirationDate = (snap.val().date || 'none');
            });
            groupsNum++;
        });
    });
}