document.addEventListener('DOMContentLoaded', function() {
  $("tbody.connect-groups").sortable({
    connectWith: ".connect-groups",
    items: "> tr:not(:first)",
    appendTo: "parent",
    helper: "clone",
    cursor: "move",
    zIndex: 999990
  });

  $('#addClass').submit(function(event) {
    var db = firebase.database();
    var ref = db.ref();
    $(this).find("#className").prop('disabled', true);
    var titleToSend = $('#classNameTextBox').val();
    var classesRef = ref.child("classes");
    var classKey = classesRef.push({
      "classMembers" : { "studentID" : true },
      "className" : titleToSend,
      "groups" : { "groupID" : true },
      "teacher" : uid
    }).key;
    var teacherClassesRef = ref.child("users/" + uid + "/classes");
    teacherClassesRef.update({
      [classKey]: "true"
    });
  });

  $("#classes").change(function() {
    var numGroupsSubmit = document.getElementById('numGroups');
    if ($(this).val() == 'Initial') {
      numGroupsSubmit.disabled = true;
    } else {
      numGroupsSubmit.disabled = false;
    }
  });

  $('#numGroupsForm').submit(function(event) {
    event.preventDefault(); // prevents page refresh on submit
    var currentClass = document.getElementById('classes').value;
    var numGroups = $('#numGroupsTextBox').val();
    var classSize = 0;
    var groupsLoc = 'classes/' + uid + '/' + currentClass + 'grouped';
    var groupsRef = firebase.database().ref(groupsLoc);

    groupsRef.once('value', function(snapshot) {
      console.log(snapshot.key);
    });
    alert(classSize)
    /*if (classSize < numGroups) {
      alert('The number of groups cannot be larger than the number of students in the class.');
    } else {
      var maxGroupSize = Math.floor(classSize / numGroups);
      var leftoverStudents = classSize % numGroups;
      var minGroupSize = maxGroupSize - 1;
      var minGroupSizedGroups = maxGroupSize - leftoverStudents;
      var maxGroupSizedGroups = numGroups - minGroupSizedGroups;
      alert(maxGroupSizedGroups + ' groups of size ' + maxGroupSize + ' and ' + minGroupSizedGroups + ' groups of size ' + minGroupSize + '.');
    }*/
  });
});