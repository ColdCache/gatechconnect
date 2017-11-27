document.addEventListener('DOMContentLoaded', function() {

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

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            uid = user.uid ? user.uid : null;
        }
    });

    checkJoinClassURL();

    function checkJoinClassURL() {
        var joinAttempt = document.getElementById('join-class-attempt');
        var url = window.location.pathname.split("/");
        var classID = url[2];
        var classRef = db.ref("classes");
        var classMemberRef = db.ref("classes/" + classID + "/classMembers");
        var canJoinClass = false;
        if (classID != undefined) {
            classRef.on('child_added', function(classSnap) {
                // Check if valid class in Firebase
                if (classSnap.key == classID) {
                    // Check if the user is already in the class
                    canJoinClass = true;
                    classMemberRef.on('child_added', function(classMemberSnap) {
                        if (classMemberSnap.key == uid) {
                            canJoinClass = false;
                        }
                    });
                }
                if (canJoinClass) {
                    console.log(canJoinClass);
                    // Add user ID under class members for specific class in DB
                    classMemberRef.update({
                        [uid] : true
                    });
                    // Add class ID under classes for specific user in DB
                    db.ref("users/" + uid + "/classes").update({
                        [classID] : true
                    });
                    joinAttempt.innerHTML = "Successfully joined class " + classID + ".";
                } else {
                    joinAttempt.innerHTML = "Error in joining class " + classID + ".";
                }
            });
        } else {
            console.log("Class ID is undefined");
        }
    }
});