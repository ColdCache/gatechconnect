document.addEventListener('DOMContentLoaded', function() {

  var firstNames = [];
  var lastNames = [];
  var saveButton = document.getElementById("saveGroupButton");
  var saveRosterButton = document.getElementById("saveRosterButton");
  
  saveButton.addEventListener("click", saveGroupToDB);
  saveRosterButton.addEventListener("click", saveRosterToDB);

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
    if (user) {
      uid = user.uid ? user.uid : null;
    }
    var dropDown = document.getElementById("classes");
    currentClass = dropDown.value;
    dropDown.addEventListener("change", changeRoster);
    var teacherClassesRef = db.ref("users/" + uid + "/classes"); // ref for teacher classes
    teacherClassesRef.orderByKey().on('child_added', function(snapshot) { // for each teacher class
      var classRef = db.ref("classes/" + snapshot.key + "/className"); // ref for teacher class name
      classRef.on('value', function(classSnap) {
        var z = document.createElement("option");
        z.setAttribute("value", snapshot.key);
        z.setAttribute("label", classSnap.val());
        var t = document.createTextNode(classSnap.val());
        z.appendChild(t);
        dropDown.appendChild(z);
        currentClass = dropDown.value;
      });
    });
  });

  function saveGroupToDB() {
    console.log("button clicked.");
    var currentGroup = document.getElementById("groups").value;
    if (currentGroup.localeCompare("Initial") === 0) {
      alert("Pick a group before saving.");
      console.log("Pick a group before saving.");
      changeRoster();
    } else {
    
      var rowNumber = 1;

      var classRef = db.ref("classes/" + currentClass + "/classMembers");
      var groupRef = db.ref("groups/" + currentGroup + '/members');
          
      var table = document.getElementById('groupedStudents');

      var members = {};
      for (var i = 1; i < table.rows.length; i++) {
        studentId = table.rows[i].cells[2].innerHTML;
        classRef.child(studentId).remove();
        members[studentId] = true;
      }
      groupRef.set(members);
      changeGroup();
    }
  }

  function saveRosterToDB() {
    console.log("button clicked.");
    var currentClass = document.getElementById("classes").value;
    var currentGroup = document.getElementById("groups").value;
    if (currentClass.localeCompare("Initial") === 0) {
      alert("Pick a class before saving.");
      console.log("Pick a class before saving.");
      changeGroup();
    } else {
      var rowNumber = 1;

      var classRef = db.ref("classes/" + currentClass + "/classMembers");
      var groupRef = db.ref("groups/" + currentGroup + "/members");

      var table = document.getElementById('ungroupedStudents');

      var roster = {};
      for (var i = 1; i < table.rows.length; i++) {
        studentId = table.rows[i].cells[2].innerHTML;
        groupRef.child(studentId).remove();
        roster[studentId] = true;
      }
      classRef.set(roster);
      changeRoster2();
    }
  }

  function changeRoster() {
    var currentClass = document.getElementById('classes').value;

    var classRef = db.ref("classes/" + currentClass + "/classMembers");
    var teacherClassesRef = db.ref("users/" + uid + "/classes");

    document.getElementById('ungrouped-students').innerHTML = '<th>First Name</th><th>Last Name</th><th style="display:none;">UID</th>';
    
    classRef.orderByKey().on('child_added', function(snapshot) {
      var rowNumber = 1;


      var firstNameRef = db.ref("users/" + snapshot.key + "/firstName");
      var lastNameRef = db.ref("users/" + snapshot.key + "/lastName");

      var table = document.getElementById('ungroupedStudents');
      var row = table.insertRow(rowNumber);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      firstNameRef.on('value', function(firstSnap) {
        cell1.innerHTML = firstSnap.val();
      });
      lastNameRef.on('value', function(lastSnap) {
        cell2.innerHTML = lastSnap.val();
      });
      cell3.innerHTML = snapshot.key;
      cell3.style.visibility = "hidden";
      rowNumber++;
    });
    
    var groups = db.ref('classes/' + currentClass + "/groups");

    var dropDown2 = document.getElementById("groups");
    while  (dropDown2.length > 1) {
      dropDown2.remove(dropDown2.length - 1);
    }

    var table2 = document.getElementById('groupedStudents');

    document.getElementById('grouped-students').innerHTML = '<th>First Name</th><th>Last Name</th><th style="display:none;">UID</th>';

    dropDown2.addEventListener("change", changeGroup);
  
    groups.orderByKey().on("child_added", function(snapshot) {
      var groupNameRef = db.ref("groups/" + snapshot.key + "/name");

      groupNameRef.on('value', function(groupSnap) {
        var z = document.createElement("option");
        z.setAttribute("value", snapshot.key);
        z.setAttribute("label", groupSnap.val());
        var t = document.createTextNode(groupSnap.val());
        z.appendChild(t);
        dropDown2.appendChild(z);
      });
    });
  
    dropDown2.value = "Initial";
  }

  function changeRoster2() {
    var currentClass = document.getElementById('classes').value;

    var classRef = db.ref("classes/" + currentClass + "/classMembers");
    var teacherClassesRef = db.ref("users/" + uid + "/classes");

    document.getElementById('ungrouped-students').innerHTML = '<th>First Name</th><th>Last Name</th><th style="display:none;">UID</th>';
    
    classRef.orderByKey().on('child_added', function(snapshot) {
      var rowNumber = 1;


      var firstNameRef = db.ref("users/" + snapshot.key + "/firstName");
      var lastNameRef = db.ref("users/" + snapshot.key + "/lastName");

      var table = document.getElementById('ungroupedStudents');
      var row = table.insertRow(rowNumber);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);
      firstNameRef.on('value', function(firstSnap) {
        cell1.innerHTML = firstSnap.val();
      });
      lastNameRef.on('value', function(lastSnap) {
        cell2.innerHTML = lastSnap.val();
      });
      cell3.innerHTML = snapshot.key;
      cell3.style.visibility = "hidden";
      rowNumber++;
    });
  }

  function changeGroup() {
    var currentClass = document.getElementById("classes").value;
    var currentGroup = document.getElementById("groups").value;

    var groupRef = db.ref("groups/" + currentGroup + '/members');

    document.getElementById('grouped-students').innerHTML = '<th>First Name</th><th>Last Name</th><th style="display:none;">UID</th>';
    
    var table = document.getElementById('groupedStudents');
    
    groupRef.orderByKey().on('child_added', function(snapshot) { // for each teacher group
      var rowNumber = 1;
      var firstNameRef = db.ref("users/" + snapshot.key + "/firstName");
      var lastNameRef = db.ref("users/" + snapshot.key + "/lastName");

      var row = table.insertRow(rowNumber);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);

      firstNameRef.on('value', function(firstNameSnap) {
        cell1.innerHTML = firstNameSnap.val();
        firstNames.push(firstNameSnap.val());
      });
      lastNameRef.on('value', function(lastNameSnap) {
        cell2.innerHTML = lastNameSnap.val();
        lastNames.push(lastNameSnap.val());
      });
      cell3.innerHTML = snapshot.key;
      cell3.style.visibility = "hidden";
      rowNumber++;
    });

    changeRoster2();
  }
  

  /* Determines class size based on the current class selected +
   * disables submit button for number of groups if a class is
   * not selected */
  $("#classes").change(function() {
    classSize = 0;
    currentClass = document.getElementById('classes').value;
    var teacherClassesRef = db.ref("users/" + uid + "/classes");
    teacherClassesRef.orderByKey().on('child_added', function(snapshot) { // for each teacher class
      var classRef = db.ref("classes/" + snapshot.key); // ref for teacher class
      classRef.on('value', function(classSnap) {
        if (classSnap.val().className == currentClass) { // check for matching class by name
          var teacherClassesRef = db.ref("users/" + uid + "/classes");
          var classMembersRef = db.ref("classes/" + snapshot.key + "/classMembers");
          classMembersRef.on('value', function(classMemberSnap) {
            classMemberSnap.forEach(function(classMember) {
              classSize++;
            });
          });
        }
      });
    });
    var numGroupsSubmit = document.getElementById('numGroups');
    if ($(this).val() == 'Initial') {
      numGroupsSubmit.disabled = true;
    } else {
      numGroupsSubmit.disabled = false;
    }
  });

  /* Determines number of groups + their respective group sizes
   * based on teacher input of number of total groups */
  $('#numGroupsForm').submit(function(event) {
    event.preventDefault(); // prevents page refresh on submit
    var numGroups = $('#numGroupsTextBox').val();
    if (Number.isInteger(Number(numGroups)) && (numGroups > 0)) { // make sure proper text field input
      if (classSize < numGroups) {
        alert('The number of groups (' + numGroups + ') cannot be larger than the number of students (' + classSize + ') in the class.');
      } else {
        var minGroupSizedGroups = 0;
        var maxGroupSizedGroups = 0;
        var minGroupSize =  0;
        var maxGroupSize = 0;
        var fractionMaxSizedGroups = 0.0;
        minGroupSize = Math.floor(classSize / numGroups);
        maxGroupSize = minGroupSize + 1;
        fractionMaxSizedGroups = classSize / numGroups - minGroupSize;
        for (var i = 0; i < numGroups; i++) {
          if ((Math.abs(Number(i / numGroups) - fractionMaxSizedGroups)) <= 0.001) { // margin of error for decimals
            maxGroupSizedGroups = i;
            minGroupSizedGroups = numGroups - maxGroupSizedGroups;
            break;
          }
        }
        var alertNumGroupsWithSizes = "";
        if (minGroupSizedGroups > 0) {
          alertNumGroupsWithSizes += minGroupSizedGroups + ' group(s) of size ' + minGroupSize + '.\n';
        }
        if (maxGroupSizedGroups > 0) {
          alertNumGroupsWithSizes += maxGroupSizedGroups + ' group(s) of size ' + maxGroupSize + '.';
        }
        alert(alertNumGroupsWithSizes);
      }
    } else if (!Number.isInteger(Number(numGroups))) {
      alert('Please enter a valid integer.');
    } else {
      alert('Please enter a group size greater than 0.');
    }
  });

  /* Adds group to appropriate sections of FireBase database (groups, users, classes)
   * WORK IN PROGRESS*/
  function addGroup(groupNumber, groupSize, classMemberIndex) {
    var groupName = "Group " + groupNumber;
    var groupsRef = db.ref("groups");
    // Add a group to groups section of database
    var groupsKey = groupsRef.push({
      "class" : classID,
      "members" : { "studentID" : true }, // change to iterate over groupNumber students starting from classMemberIndex
      "name" : groupName,
      "teacher" : uid
    }).key;
    // Add group ID under groups for specific class in database
    var classGroupsRef = db.ref("classes/groups").update({
      [groupsKey]: true      
    });
    /* Add group ID under groups for specific users in database */
    // this adds the group under the teacher's group list
    var userGroupsRef = db.ref("users/" + uid + "/groups").update({
      [groupsKey]: true
    })
    // iterate over students in this group and add under their userid
    console.log("group added");
  }
});