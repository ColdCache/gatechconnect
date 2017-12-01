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
    var groupSize = $('#groupSize').val();
    var numStudents = 0;
    if (surveyKey == 'Initial' || courseKey == 'Initial' || groupSize == 0) {
        alert('You have not selected a survey or class to sort with.');
    } else {
        var questionsRef = firebase.database().ref('surveys/' + surveyKey + '/questions');
        var studentsRef = firebase.database().ref('classes/' + courseKey + '/ungrouped');
        studentsRef.on('value', function(students) {
            var numStudents = students.numChildren();
        })
        questionsRef.orderByKey().on('child_added', function(question) {
            var questionKey = question.key;
            var choice = $('#' + question.key).val();
            var questionRef = firebase.database().ref('questions/' + questionKey);
            var answers = [];
            questionRef.on('value', function(questionData) {
                var questionType = questionData.val().type;
                var numAnswers = questionData.val().num;
                var studentsRef = firebase.database().ref('classes/' + courseKey + '/ungrouped');
                var qAnswers = [numAnswers];
                if (questionType == 'Rating Scale') {
                    for (i = 1; i <= numAnswers; i++) {
                        qAnswers[i] = [];
                    }
                } else if (questionType == 'Multiple Choice') {
                    var answersRef = firebase.database().ref('questions/' + questionKey + '/answers');
                    answersRef.orderByKey().on('child_added', function(answers) {
                        for (i = 1; i <= numAnswers; i++) {
                            qAnswers[answers.val()] = [];
                        }
                    });
                }
                studentsRef.orderByKey().on('child_added', function(student) {
                    var responseRef = firebase.database().ref('responses/' + student.key + '/' + questionKey);
                    responseRef.on('value', function(answer) {
                        qAnswers[answer.val()].push(student.key);
                    });
                });
                answers.push(qAnswers);
            });
            console.log(answers);
            if (choice == 'similar') {
                
            } else if (choice == 'different') {
                            
            } else if (choice == 'same') {
                
            } else if (choice == 'varied') {
                
            }
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
                similarOption.setAttribute('value', 'similar');
                similarOption.appendChild(similarText);
                select.appendChild(similarOption);
                var diffOption = document.createElement('option');
                var diffText = document.createTextNode('As Different As Possible');
                diffOption.setAttribute('value', 'different');
                diffOption.appendChild(diffText);
                select.appendChild(diffOption);
            } else if (type == 'Multiple Choice') {
                var sameOption = document.createElement('option');
                var sameText = document.createTextNode('Same Choice');
                sameOption.setAttribute('value', 'same');
                sameOption.appendChild(sameText);
                select.appendChild(sameOption);
                var variedOption = document.createElement('option');
                var variedText = document.createTextNode('Varied Choice');
                variedOption.setAttribute('value', 'varied');
                variedOption.appendChild(variedText);
                select.appendChild(variedOption);
            }

            questionDiv.appendChild(select);
            questionsDiv.appendChild(questionDiv);
        });
    });
  });

