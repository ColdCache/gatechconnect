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
            console.log(groupID);
            /*
            // iterate through each of the user's groups
            var groupRef = firebase.database().ref().child('groups').child(groupID);
            groupRef.orderByKey().on('child_added', function(snap) {
                var groupName = row.insertCell(0);
                var course = row.insertCell(1);
                var teacher = row.insertCell(2);
                var members = row.insertCell(3);
            
                // iterate through the group's data entries
                var studentRef = firebase.database().ref().child('users').child(uid)
                studentRef.on('value', function(snap) {
                    //console.log(snap.val());
                    groupName = (snap.val().name || 'none');
                    course = (snap.val().course || 'none');
                    teacher = (snap.val().teacher || 'none');
                    /*console.log('group name: '+ groupName);
                    console.log('course: '+ course);
                    console.log('teacher: '+ teacher);
                });
                groupsNum++;
            });
            */
        });
    });
});