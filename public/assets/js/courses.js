document.addEventListener('DOMContentLoaded', function() {
    var groupsTable = document.getElementById('groups');
    var groupsNum = 1;
    var groupsRef = firebase.database() + '/users/' + uid + '/groups';

    // iterate through user's groups
    groupsRef.orderByKey().on('child_added').then(function(snapshot) {
        var row = groupsTable.insertRow(groupsNum);
        var groupID = snapshot.key;

        // iterate through each of the user's groups
        var groupRef = firebase.database() + '/groups/' + groupID;
        groupRef.orderByKey.on('child_added', function(snapshot) {
            var groupName = row.insertCell(0);
            var course = row.insertCell(1);
            var teacher = row.insertCell(2);
            var members = row.insertCell(3);

            // iterate through the group's data entries
            studentRef.on('value', function(snap) {
                groupName = (snap.val().name || 'none');
                course = (snap.val().course || 'none');
                teacher = (snap.val().teacher || 'none');
            });
        });

        groupsNum++;
    });
});