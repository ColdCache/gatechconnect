var showSurvey = false;
var takeSurvey = false;
var studentSurvey = null;
var questionNum = 0;

// show create survey form for teachers
$('#showSurveyForm').click(function () {
    if (showSurvey) {
        $('#create-survey').hide();
        $('#showSurveyForm').text('Show Survey Form');
        showSurvey = false;
    } else {
        $('#create-survey').show();
        $('#showSurveyForm').text('Hide Survey Form');
        hideQuestionTypes();
        showSurvey = true;
    }
});

// hide/show functionality for take survey for students
$('#takeSurvey').click(function () {
    if (takeSurvey) {
        $('#take-survey').hide();
        $('#takeSurvey').text('Show Survey');
        takeSurvey = false;
    } else {
        $('#take-survey').show();
        $('#takeSurvey').text('Hide Survey');
        hideQuestionTypes();
        takeSurvey = true;
    }
});

// add question types on click
$('#addQuestion').click(function () {
    $('#multipleChoice').show();
    $('#ratingScale').show();
    $('#addQuestion').hide();
});

// add multiple choice question type
$('#addMultChoice').click(function () {
    hideQuestionTypes();
    var numAnswers = document.getElementById('multAnswers').value;
    if (numAnswers != '' && numAnswers != '0') {
        // add multiple choice question option if valid # of entries
        questionNum++;
        var questions = document.getElementById('questions');
        var formGroup = document.createElement('div');
        formGroup.setAttribute('class', 'form-group');
        // create question element
        var question = document.createElement('input');
        question.setAttribute('type', 'text');
        question.setAttribute('id', 'question' + questionNum);
        question.setAttribute('class', 'form-control');
        question.setAttribute('placeholder', 'Question');
        var questionType = document.createTextNode('Multiple Choice: out of ' + numAnswers);
        formGroup.appendChild(questionType);
        formGroup.appendChild(question);

        // create answer options
        for (i = 1; i <= numAnswers; i++) {
            var answer = document.createElement('input');
            answer.setAttribute('type', 'text');
            answer.setAttribute('id', questionNum + 'answer' + i);
            answer.setAttribute('class', 'form-control');
            answer.setAttribute('placeholder', 'Answer');
            formGroup.appendChild(answer);
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

        // create question element
        var question = document.createElement('input');
        question.setAttribute('type', 'text');
        question.setAttribute('id', 'question' + questionNum);
        question.setAttribute('class', 'form-control');
        question.setAttribute('placeholder', 'Question');
        var questionType = document.createTextNode('Rating Scale Question: out of ' + numAnswers);
        question.setAttribute('name', '0');
        formGroup.appendChild(questionType);
        formGroup.appendChild(question);
        questions.appendChild(formGroup);
    }
});

function hideQuestionTypes() {
    $('#multipleChoice').hide();
    $('#ratingScale').hide();
    $('#addQuestion').show();
}

$('#submitSurvey').click(function() {
    // pull survey data from document

    // save data to object

    // save survey response to database

    // update user's surveys list
});

$('#createSurvey').click(function () {
    // pull survey data from document
    var surveyName = document.getElementById('surveyName').value;
    var surveyType = 'none';
    var academic = document.getElementById('academic-radio');
    var personal = document.getElementById('personal-radio');
    var teamwork = document.getElementById('teamwork-radio');
    var other = document.getElementById('other-radio');
    // pull survey type
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
            answers['value'] = answerObj.name;
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

        // save survey to survey database
        surveyRef.set({
            name: surveyName,
            type: surveyType,
            instructor: surveyInstructor,
            date: surveyDate,
            questions: questionIDs
        });
        // update instructor's surveys list
        instructorRef = firebase.database().ref('users/' + firebase.auth.currentUser.uid + '/surveys');
        surveys = {};
        surveys[surveyID] = 'true';
        instructorRef.update(surveys);

        // update course's surveys list in database
        var courseRef = firebase.database().ref('classes/' + surveyCourse + '/surveys/');
        var course = {};
        course[surveyCourse] = 'true';
        courseRef.update(course);
        
        // update each class member's surveys list with new survey
        var classMembers = firebase.database().ref('classes/' + surveyCourse + '/classMembers');
        classMembers.orderByKey().on('child_added', function(student) {
            var studentID = student.val().key;
            var responseRef = firebase.database().ref('users/' + studentID + '/surveys');
            var responses = {};
            responses[surveyID] = 'false';
            responseRef.update(responses);
        });
        
        location.reload();
    } else {
        console.log('Error accepting survey data, data is not valid.');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var accountType = 'none';
    $('#create-survey').hide();
    $('#take-survey').hide();
    $('#datepicker').datepicker();
    auth.onAuthStateChanged(function (user) {
        // load user data based on user's session data
        if (user) {
            var uid = user.uid;
            var accountRef = firebase.database().ref().child('users').child(uid);
            accountRef.on('value', function (snap) {
                accountType = (snap.val().accountType || 'none');
                if (accountType == 'instructor') {
                    $("#showSurveyForm").show();
                    populateSurveyForm(uid);
                    loadInstructorSurveys(uid);
                } else if (accountType == 'student') {
                    $("#showSurveyForm").hide();
                    $("#takeSurvey").show();
                    if (studentSurvey == null) {
                        $('#fillerText').show();
                    }
                    loadStudentSurveys(uid);
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

        // pull course data and fill courses dropdown with options
        courseRef.on('value', function (snap) {
            var option = document.createElement('option');
            option.setAttribute('value', snap.key);
            var courseText = document.createTextNode(snap.val().className);
            option.appendChild(courseText);
            coursesSelect.appendChild(option);
        });
    });

    // set instructor info from database
    var surveyInstructor = document.getElementById('surveyInstructor');
    surveyInstructor.setAttribute('name', uid);
    instructorRef = firebase.database().ref('users/' + uid);
    instructorRef.on('value', function (snap) {
        surveyInstructor.setAttribute('value', snap.val().firstName + ' ' + snap.val().lastName);
    });
}

// load student's dashboard for surveys
function loadStudentSurveys(uid) {
    var surveysTable = document.getElementById('surveys');
    var usersSurveys = firebase.database().ref('users/' + uid + '/surveys');

    usersSurveys.orderByKey().on('child_added', function(survey) {
        var surveyID = survey.key;
        var surveyRef = firebase.database().ref('surveys/' + surveyID);

        // pull each survey's data from surveys database
        surveyRef.on('value', function(survsnap) {
            var row = surveysTable.insertRow(-1);
            var surveyName = row.insertCell(0);
            var name = document.createTextNode(survsnap.val().name);
            surveyName.appendChild(name);
            var surveyType = row.insertCell(1);
            var type = document.createTextNode(survsnap.val().type);
            surveyType.appendChild(type);
            var teacherID = survsnap.val().instructor;
            var instructorRef = firebase.database().ref('users/' + teacherID);

            instructorRef.on('value', function(insSnap) {
                var instructorName = row.insertCell(2);
                var instructor = document.createTextNode(insSnap.val().firstName + ' ' + insSnap.val().lastName);
                instructorName.appendChild(instructor);
                var expirationDate = row.insertCell(3);
                var date = document.createTextNode(survsnap.val().date);
                expirationDate.appendChild(date);
            });

            var statusCell = row.insertCell(-1);
            var status = document.createTextNode(survey.val());
            statusCell.appendChild(status);
            
            var linkCell = row.insertCell(-1);
            var link = document.createElement('a');
            var linkText = document.createTextNode('Select');
            link.appendChild(linkText);
            link.setAttribute('id', surveyID);
            link.setAttribute('class', 'surveySelect');
            link.setAttribute('href', 'javascript: void(0)');
            linkCell.appendChild(link);
        });
    });
}

// update take survey form with student selected survey
function updateTakeSurvey(surveyID) {
    var surveyRef = firebase.database().ref('surveys/' + surveyID);
    var surveyTitle = document.getElementById('surveyTitle');
    var surveyDescription = document.getElementById('surveyDescription');
    var surveyForm = document.getElementById('questions');

    // pull survey and other relevant data from database
    surveyRef.on('value', function(survey) {
        var name = survey.val().name;
        surveyTitle.innerHTML = name;
        var type = survey.val().type;
        var instructorID = survey.val().instructor;
        var date = survey.val().date;

        // pull instructor data for survey
        var instructorRef = firebase.database().ref('users/' + instructorID);
        instructorRef.on('value', function(instructor) {
            var instructorName = instructor.val().firstName + ' ' + instructor.val().lastName;
            surveyDescription.innerHTML = 'Type: ' + type + '<br /> Date: ' + date + '<br />Instructor: ' + instructorName;
        });
        var numQuestions = 0;
        var questionsRef = firebase.database().ref('surveys/' + surveyID + '/questions');

        // pull each question's data from queston database
        questionsRef.orderByKey().on('child_added', function(questions) {
            var questionDiv = document.createElement('div');
            questionDiv.setAttribute('class', 'form-group');
            var questionID = questions.key;
            var questionRef = firebase.database().ref('questions/' + questionID);
            questionRef.on('value', function(question) {
                numQuestions++;
                var questionHeader = document.createElement('h4');
                var questionText = question.val().questionText;
                questionHeader.innerHTML = numQuestions + '. ' + questionText;
                questionDiv.appendChild(questionHeader);
                var num = question.val().num;
                var answerRef = firebase.database().ref('questions/' + questionID + '/answers');
            });
            surveyForm.appendChild(questionDiv);
        });
    });
}

// get survey id from table on survey selection
$(document).on('click', 'a.surveySelect', function() {
    var link = $(this).closest('a');
    var surveyID = link.attr('id');
    selectedSurvey = surveyID;
    updateTakeSurvey(surveyID);
    return false;
});

// load instructor's dashboard for surveys
function loadInstructorSurveys(uid) {
    var surveysTable = document.getElementById('surveys');
    var surveysRef = firebase.database().ref('users/' + uid + '/surveys');

    // iterate through user's groups
    surveysRef.orderByKey().on('child_added', function (snapshot) {
        var row = surveysTable.insertRow(-1);
        var surveyID = snapshot.key;

        // iterate through each of the user's groups
        var surveyRef = firebase.database().ref('surveys/' + surveyID);
        var surveyName = row.insertCell(0);
        var surveyType = row.insertCell(1);
        var instructorName = row.insertCell(2);
        var expirationDate = row.insertCell(3);
        var statusCell = row.insertCell(4);
        var linkCell = row.insertCell(5);

        // get data from survey
        surveyRef.on('value', function (snap) {
            var name = document.createTextNode(snap.val().name);
            surveyName.appendChild(name);
            var type = document.createTextNode(snap.val().type);
            surveyType.appendChild(type);
            var instructorID = snap.val().instructor;
            
            var instructorRef = firebase.database().ref('users/' + instructorID);
            instructorRef.on('value', function(snapshot) {
                var instructor = document.createTextNode(snapshot.val().firstName + ' ' + snapshot.val().lastName);
                instructorName.appendChild(instructor);
            });
            var date = document.createTextNode(snap.val().date);
            expirationDate.appendChild(date);
        });

        var status = document.createTextNode('status');
        statusCell.appendChild(status);
        var link = document.createTextNode('Edit Survey');
        linkCell.appendChild(link);
    });
}