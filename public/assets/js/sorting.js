var uid = null;

document.addEventListener('DOMContentLoaded', function () {
    auth.onAuthStateChanged(function (user) {
        if (user) {
            uid = user.uid;
            populateSelectForms(uid);
        }
    });
});

function populateSelectForms(uid) {
    var surveysSelect = document.getElementById('surveysSelect');
    
    
    var userRef = firebase.database().ref('users/' + uid);
    var surveysRef = firebase.database().ref('users/' + uid + '/surveys');

    surveysRef.orderByKey().on('child_added', function(survey) {
        var surveyRef = firebase.database().ref('surveys/' + survey.key);
        surveyRef.on('value', function(surveyData) {
            var option = document.createElement('option');
            option.setAttribute('value', survey.key);
            var surveyName = document.createTextNode(surveyData.val().name);
            option.appendChild(surveyName);
            surveysSelect.appendChild(option);
        });
    });
}

$('#surveySort').click(function () {
    var courseKey = $('#classes').val();
    var surveyKey = $('#surveysSelect').val();
    if (surveyKey == 'Initial') {
        alert('You have not selected a survey to sort with.');
    } else {
        var questionsRef = firebase.database().ref('surveys/' + surveyKey + '/questions');
        questionsRef.orderByKey().on('child_added', function(question) {
            var questionKey = question.key;
            var questionRef = firebase.database().ref('questions/' + questionKey);
            questionRef.on('value', function(questionData) {
                var questionType = questionData.val().type;
                var studentsRef = firebase.database().ref('classes/' + courseKey + '/ungrouped');
                var answers = [];
                studentsRef.orderByKey().on('child_added', function(student) {
                    var responseRef = firebase.database().ref('responses/' + student.key + '/' + questionKey);
                    responseRef.on('value', function(answer) {
                        answers.push(answer.val());
                    });
                });
                console.log(answers);
            });
        });
    }
    
});

$('#surveysSelect').on('change', function() {
    var questionsDiv = document.getElementById('questions');
    var surveySelected = $(this).val();
    var questionsRef = firebase.database().ref('surveys/' + surveySelected + '/questions');
    questionsRef.on('child_added', function(question) {
        var questionRef = firebase.database().ref('questions/' + question.key);
        questionRef.on('value', function(questionData) {
            var questionDiv = document.createElement('div');
            var type = questionData.val().type;
            var questionText = document.createTextNode(type + ': ' + questionData.val().questionText);
            questionDiv.appendChild(questionText);
            var select = document.createElement('select');
            select.setAttribute('id', question.key);
            var defaultOption = document.createElement('option');
            var defaultText = document.createTextNode('Do not consider when sorting.');
            defaultOption.setAttribute('value', 'none');
            defaultOption.appendChild(defaultText);
            select.appendChild(defaultOption);

            if (type == 'Rating Scale') {
                var similarOption = document.createElement('option');
                var similarText = document.createTextNode('Similar Value');
                defaultOption.setAttribute('value', 'similar');
                similarOption.appendChild(similarText);
                select.appendChild(similarOption);
                var diffOption = document.createElement('option');
                var diffText = document.createTextNode('As Different As Possible');
                defaultOption.setAttribute('value', 'different');
                diffOption.appendChild(diffText);
                select.appendChild(diffOption);
            } else if (type == 'Multiple Choice') {
                var sameOption = document.createElement('option');
                var sameText = document.createTextNode('Same Choice');
                defaultOption.setAttribute('value', 'same');
                sameOption.appendChild(sameText);
                select.appendChild(sameOption);
                var variedOption = document.createElement('option');
                var variedText = document.createTextNode('Varied Choice');
                defaultOption.setAttribute('value', 'varied');
                variedOption.appendChild(variedText);
                select.appendChild(variedOption);
            }

            questionDiv.appendChild(select);
            questionsDiv.appendChild(questionDiv);
        });
    });
  });

