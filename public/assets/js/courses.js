document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(function(user) {
        var uid = user.uid;
        var groupsTable = document.getElementById('groups');
        var groupsNum = 1;
        var studentClassRef = firebase.database().ref().child('users').child(uid).child('classes');
        
        // iterate through user's classes
        studentClassRef.orderByKey().on('child_added', function(snapshot) {
            var row = groupsTable.insertRow(groupsNum);
            var classID = snapshot.key;
            var classRef = firebase.database().ref().child('classes').child(classID);
            // iterate through class table in firebase
            classRef.on('value', function(classSnap) {
                var teacherID = classSnap.val().teacher;
                console.log("");
                var teacherRef = firebase.database().ref().child('users').child(teacherID);
                teacherRef.on('value', function(snap) {
                    var course = row.insertCell(0);
                    var teacher = row.insertCell(1);
                    var email = row.insertCell(2);

                    // get course name
                    course.innerHTML = (classSnap.val().className || 'none');
                    
                    // get teacher name
                    teacher.innerHTML = ((snap.val().firstName + " " + snap.val().lastName) || 'none');

                    // get teacher email
                    email.innerHTML = (snap.val().email || 'none');
                    
                    groupsNum++;
                });
            });
        });
    });
});