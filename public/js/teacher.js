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

  $("tbody.connect-groups").sortable({
    connectWith: ".connect-groups",
    items: "> tr:not(:first)",
    appendTo: "parent",
    helper: "clone",
    cursor: "move",
    zIndex: 999990
  });

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

  firebase.auth().onAuthStateChanged(function(user) {
    var uid = null;
    if (user) {
      uid = user.uid ? user.uid : null;
    }
    var dropDown = document.getElementById("classes");
    var currentClass = dropDown.value;
    var teacherClassesRef = db.ref("users/" + uid + "/classes"); // ref for teacher classes
    teacherClassesRef.orderByKey().on('child_added', function(snapshot) { // for each teacher class
      var classRef = db.ref("classes/" + snapshot.key + "/className"); // ref for teacher class name
      classRef.on('value', function(classSnap) {
        var z = document.createElement("option");
        z.setAttribute("value", classSnap.val());
        var t = document.createTextNode(classSnap.val());
        z.appendChild(t);
        dropDown.appendChild(z);
        currentClass = dropDown.value;
      });
    });
  });

  function changeGroup() {
    var currentClass = document.getElementById('classes').value;
    var currentGroup = document.getElementById('groups').value; // group name
    var rowNumber = 1;

    document.getElementById('grouped-students').innerHTML = '<th>First Name</th><th>Last Name</th>';
    var table = document.getElementById('groupedStudents');

    var teacherGroupsRef = db.ref("users/" + uid + "/groups"); // ref for teacher groups
    teacherGroupsRef.orderByKey().on('child_added', function(snapshot) { // for each teacher group
      var groupRef = db.ref("groups/" + snapshot.key + "/name"); // ref for teacher groups name
      groupRef.on('value', function(groupSnap) {
        if (groupSnap.val() == currentGroup) { // check for teacher group with current group name
          console.log("found it: " + groupSnap.val());
          groupMembersRef.orderByKey().on('child_added', function(memberSnap) { // for each group member
            var groupMembersRef = db.ref("users/" + memberSnap.key); // ref for user group members
            groupMembersRef.on('value', function(userSnap) {
              var row = table.insertRow(rowNumber);
              var cell1 = row.insertCell(0);
              var cell2 = row.insertCell(1);
              cell1.innerHTML = snapshot.val().FirstName;
              cell2.innerHTML = snapshot.val().LastName;
              rowNumber++;
              console.log(userSnap.val().firstName);
              console.log(userSnap.val().lastName);
            });
          });
        } else {
          console.log("not it");
        }
      });
    });
  }
/*
  function changeRoster() {
    var currentClass = document.getElementById('classes').value;
    var rowNumber = 1;
  
    var teacherClassesRef = db.ref("users/" + uid + "/classes");
    teacherClassesRef.orderByKey().on("child_added", function(snapshot) {
      var classRef = db.ref("classes/" + snapshot.key + "/className");
      classRef.on('value', function(classSnap) {

    var classLoc = 'classes/' + currentUid + '/' + currentClass + '/ungrouped';
  
    var classRef = newDB.ref(classLoc);
    document.getElementById('ungrouped-students').innerHTML = '<th>First Name</th><th>Last Name</th>';
    classRef.orderByChild('LastName').on('child_added', function(snapshot) {
      var table = document.getElementById('ungroupedStudents');
      var row = table.insertRow(rowNumber);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      cell1.innerHTML = snapshot.val().FirstName;
      cell2.innerHTML = snapshot.val().LastName;
      rowNumber++;
    });
  
    var groupReference = "classes/" + uid + '/' + currentClass + '/grouped';
    var groups = newDB.ref(groupReference);
  
    var dropDown2 = document.getElementById("groups");
    while (dropDown2.length > 1) {
      dropDown2.remove(dropDown2.length -1);
    }
  
    var table2 = document.getElementById('groupedStudents');
    
    while (table2.rows.length > 1) {
      table2.deleteRow(table2.rows.length - 1);
    }
  
    dropDown2.addEventListener("change", changeGroup);
  
    groups.orderByKey().on("child_added", function(snapshot) {
      var z = document.createElement("option");
      z.setAttribute("value", snapshot.key);
      var t = document.createTextNode(snapshot.key);
      z.appendChild(t);
      dropDown2.appendChild(z);
    });
  
    dropDown2.value = "Initial";
  }*/

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
    var classSize = 0;
    var currentClass = document.getElementById('classes').value;
    var teacherClassesRef = db.ref("users/" + uid + "/classes");
    teacherClassesRef.orderByKey().on('child_added', function(snapshot) { // for each teacher class
      var classRef = db.ref("classes/" + snapshot.key); // ref for teacher class
      classRef.on('value', function(classSnap) {
        if (classSnap.val().className == currentClass) { // check for matching class by name
          console.log("The matching class is: " + classSnap.val().className); // for debugging
          var teacherClassesRef = db.ref("users/" + uid + "/classes");
          var classMembersRef = db.ref("classes/" + snapshot.key + "/classMembers");
          classMembersRef.on('value', function(classMemberSnap) {
            classMemberSnap.forEach(function(classMember) {
              console.log(classMember.key); // for debugging
              classSize++;
              console.log(classSize); // for debugging
            });
          });
        }
      });
    });
    var numGroups = $('#numGroupsTextBox').val();
    if (classSize < numGroups) {
      alert('The number of groups (' + numGroups + ') cannot be larger than the number of students (' + classSize + ') in the class.');
    } else {
      var maxGroupSize = Math.ceil(classSize / numGroups);
      var leftoverStudents = classSize % numGroups;
      var minGroupSize = maxGroupSize - 1;
      /*var minGroupSizedGroups = maxGroupSize - leftoverStudents;
      var maxGroupSizedGroups = numGroups - minGroupSizedGroups;
      alert(maxGroupSizedGroups + ' groups of size ' + maxGroupSize + ' and ' + minGroupSizedGroups + ' groups of size ' + minGroupSize + '.');*/
    }
  });
});