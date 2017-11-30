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
    var accountType;
    var url = window.location.pathname.split("/");
    var classID = url[2];
    var canJoinClass;
    var classRef = db.ref("classes");
    var classMemberRef = db.ref("classes/" + classID + "/classMembers");

    checkJoinClassURL();

    // Checks the users account type, since only students can sign up for a class
    function checkAccountType(_callback) {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                uid = user.uid ? user.uid : null;
                accountTypeRef = db.ref('/users/' + uid);
                accountTypeRef.once('value').then(function(snapshot) {
                    accountType = snapshot.val().accountType;
                    // Use a callback to wait for an account type to be found asynchronously
                    _callback();
                });
            }
        });
    }

    function validClassAndStudent(_callback) {        
        canJoinClass = true;

        if (classID != undefined) {
            if ((accountType == undefined) || (accountType == 'instructor')) {
                alert("Invalid account type. Only students may join a class.");
            } else {
                classRef.on('child_added', function(classSnap) {
                    // Check if valid class in Firebase
                    if (classSnap.key == classID) {
                        // Check if the user is already in the class
                        classMemberRef.on('child_added', function(classMemberSnap) {
                            if (canJoinClass && (classMemberSnap.key == uid)) {
                                canJoinClass = false;
                            }
                        });
                        _callback();
                    }
                });
            }
        }
    }

    function checkJoinClassURL() {
        checkAccountType(function() {
            validClassAndStudent(function() {
                var msg = "Error in joining class with ID " + classID + ".";
                if (canJoinClass) {
                    // Add user ID under class members for specific class in DB
                    classRef.child(classID + "/classMembers").update({
                        [uid] : true
                    });
                    // Add user ID under ungrouped students for this class in DB
                    classRef.child(classID + "/ungrouped").update({
                        [uid] : true
                    });
                    // Add class ID under classes for specific user in DB
                    db.ref("users/" + uid + "/classes").update({
                        [classID] : true
                    });
                    msg = "Successfully joined class with ID " + classID + ".";
                }
                alert(msg);
            });
        });
    }
});