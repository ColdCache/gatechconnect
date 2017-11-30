document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(function(user) {
        var uid = user.uid;
        var groupsTable = document.getElementById('groups');
        var groupsRef = firebase.database().ref().child('users').child(uid).child('groups');
        
        // iterate through user's groups
        groupsRef.orderByKey().on('child_added', function(snapshot) {
            var row = groupsTable.insertRow(-1);
            var groupID = snapshot.key;

            var groupCourse = row.insertCell(0);
            var groupTeacher = row.insertCell(1);
            var groupName = row.insertCell(2);
            var members = row.insertCell(3);
            var membersList = document.createElement('ul');
            members.append(membersList);
        
            // iterate through each of the user's groups
            var groupRef = firebase.database().ref().child('groups').child(groupID);
            groupRef.orderByKey().on('value', function(snap) {
                
                var name = document.createTextNode(snap.val().name);
                groupName.append(name);
                var instructorKey = snap.val().teacher;
                instructorRef = firebase.database().ref('users/' + instructorKey);
                instructorRef.on('value', function(instructor) {
                    var instructorName = document.createTextNode(instructor.val().firstName + ' ' + instructor.val().lastName);
                    groupTeacher.append(instructorName);
                });
                var courseKey = snap.val().class;
                courseRef = firebase.database().ref('classes/' + courseKey);
                courseRef.on('value', function(course) {
                    var courseName = document.createTextNode(course.val().className);
                    groupCourse.append(courseName);
                });
                var studentsRef = firebase.database().ref('groups/' + groupID + '/members');
                studentsRef.orderByKey().on('child_added', function(member) {
                    var studentKey = member.key;
                    var studentRef = firebase.database().ref('users/' + studentKey);
                    // iterate through the student's data entries
                    studentRef.on('value', function(student) {
                        var studentName = document.createTextNode(student.val().firstName + ' ' + student.val().lastName);
                        var listItem = document.createElement('li');
                        listItem.appendChild(studentName);
                        members.appendChild(listItem);
                    });
                });
            });
        });
    });
});