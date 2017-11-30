document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(function(user) {
        var uid = user.uid;
        var groupsTable = document.getElementById('groups');
        var groupsNum = 1;
        var groupsRef = firebase.database().ref().child('users').child(uid).child('groups');
        
        // iterate through user's groups
        groupsRef.orderByKey().on('child_added', function(snapshot) {
            var row = groupsTable.insertRow(groupsNum);
            var groupID = snapshot.key;
            //console.log(groupID);
            
            // iterate through each of the user's groups
            var groupRef = firebase.database().ref().child('groups').child(groupID);
            groupRef.on('value', function(snap) {
                var course = row.insertCell(0);
                var teacher = row.insertCell(1);
                var groupName = row.insertCell(2);
                var members = row.insertCell(3);
                members.innerHTML = "";

                // get class name
                var classRef = firebase.database().ref().child('classes').child(snap.val().class);
                classRef.on('value', function(snap) {
                    course.innerHTML = (snap.val().className || 'none');
                });
                
                // get teacher name
                var teacherRef = firebase.database().ref().child('users').child(snap.val().teacher);
                teacherRef.on('value', function(snap) {
                    teacher.innerHTML = ((snap.val().firstName + " " + snap.val().lastName) || 'none');
                });

                // get group members ids
                for (var memberID in snap.val().members) {
                    var memberRef = firebase.database().ref().child('users').child(memberID);
                    // get group member names and emails
                    memberRef.on('value', function(snap) {
                        members.innerHTML += ((snap.val().firstName + " " + snap.val().lastName + " (" + snap.val().email + ")") || 'none') + "</br>";
                    });
                }
                groupName.innerHTML = (snap.val().name || 'none');
                groupsNum++;
            });
        });
    });
});