
// FIREBASE CONFIG
var config = {
    apiKey: "AIzaSyAhKnwZ_l8jwtMQFc7mBh30l96NLyZq03Q",
    authDomain: "gatechconnect.firebaseapp.com",
    databaseURL: "https://gatechconnect.firebaseio.com",
    projectId: "gatechconnect",
    storageBucket: "gatechconnect.appspot.com",
    messagingSenderId: "671330762711"
};

//INITIALIZE FIREBASE WEB APP
if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

var db = firebase.database();
var ref = db.ref();
var classSize;
var currentClass;
var uid;
var classKey;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        uid = user.uid ? user.uid : null;
    }
    // var dropDown = document.getElementById("classes");
    // currentClass = dropDown.value;
    // dropDown.addEventListener("change", changeRoster);
    var teacherClassesRef = db.ref("users/" + uid + "/classes"); // ref for teacher classes
    console.log(teacherClassesRef)
    teacherClassesRef.orderByKey().on('child_added', function(snapshot) { // for each teacher class
        var classRef = db.ref("classes/" + snapshot.key + "/className"); // ref for teacher class name
        // classRef.on('value', function(classSnap) {
        //     var z = document.createElement("option");
        //     z.setAttribute("value", snapshot.key);
        //     z.setAttribute("label", classSnap.val());
        //     var t = document.createTextNode(classSnap.val());
        //     z.appendChild(t);
        //     dropDown.appendChild(z);
        //     currentClass = dropDown.value;
        // });
    });


});

    function addRow() {
        $("#Emails tbody").append("<tr><td><input type='email' required /></td><td>" + "</td><td onclick='removeRow(this)'>remove x</td></tr>");
    }

    function removeRow(ele) {
        $(ele).parent().remove();
    }

    $('#addClass').submit(function(event) {
        $(this).find("#className").prop('disabled', true);
        var titleToSend = $('#classNameTextBox').val();
        var classesRef = ref.child("classes");

        var classKey = classesRef.push({
            "classMembers" : { "studentID" : true },
            "className" : titleToSend,
            "groups" : { "groupID" : true },
            "teacher" : uid
        }).key; // add class to classes table in database
        var teacherClassesRef = ref.child("users/" + uid + "/classes");
        // add class key under instructor classes in database
        teacherClassesRef.update({
            [classKey]: "true"
        });
    });



    function sendRequest() {
        // $("#Icon-Loading").addClass("glyphicon-spin");
        var roster = [];

        $("#Emails tbody>tr").each(function(index, ele) {
            var tds = $(ele).find("td");
            h = {
                email: $(tds[0]).find("input").val()
                // permission: $(tds[1]).find("select").val()
            };
            roster.push(h);
            console.log("student :" + JSON.stringify(roster));
        });

        currentClass = document.getElementById("classes").value;
        var classRef = db.ref("classes/" + currentClass + "/classMembers");
        console.log("classRef: " + classRef);

        var classURL = ref.child("classes/" + currentClass);
        console.log("classURL: " + classURL);

        for (var i = 0; i < roster.length; i++) {
            console.log("student to add: " + JSON.stringify(roster[i].email));
            userRef = db.ref("users")

            if (userRef.orderByChild('email').equalTo(roster[i].email))
        }
        classRef.update({
            classMember: roster
        });
        // var jsonObject = {
        //     siteUrl: classURL,
        //     relativeUrl: "itemUrl",
        //     key: "ThisIsAKey",
        //     invitedUsers: roster
        // };
        // console.log({
        //     json: JSON.stringify(jsonObject)
        // });
        // $('#message').text("MessageSent:\n" + JSON.stringify(jsonObject, null, 4));

        //send json and have success and failure call backs on ajax
    }
