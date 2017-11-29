document.addEventListener('DOMContentLoaded', function() {

  var firstNames = [];
  var lastNames = [];
  var classMemberIDList = [];

  var saveRosterButton = document.getElementById("saveRosterButton");
  
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
  
  /* Makes X number of groups & determines their sizes
   * based on teacher input of number of total groups */
  $('#numGroupsForm').submit(function(event) {
	$(this).find("numGroups").prop('disabled', true);
    var studentEmail = $('#numGroupsTextBox').val();
	console.log(studentEmail);
	alert(studentEmail);
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

      var table = document.getElementById('classRoster');

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

    document.getElementById('class-roster').innerHTML = '<th>First Name</th><th>Last Name</th><th style="display:none;">UID</th>';
    
    classRef.orderByKey().on('child_added', function(snapshot) {
      var rowNumber = 1;


      var firstNameRef = db.ref("users/" + snapshot.key + "/firstName");
      var lastNameRef = db.ref("users/" + snapshot.key + "/lastName");

      var table = document.getElementById('classRoster');
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
      cell3.style.display = "none";
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

    document.getElementById('class-roster').innerHTML = '<th>First Name</th><th>Last Name</th><th style="display:none;">UID</th>';
    
    classRef.orderByKey().on('child_added', function(snapshot) {
      var rowNumber = 1;

      var firstNameRef = db.ref("users/" + snapshot.key + "/firstName");
      var lastNameRef = db.ref("users/" + snapshot.key + "/lastName");

      var table = document.getElementById('classRoster');
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
      cell3.style.display = "none";
      rowNumber++;
    });
  }

  /* Determines class size based on the current class selected +
   * disables submit button for number of groups if a class is
   * not selected
   * Updates class member id list and last name list */
  $("#classes").change(function() {
    classSize = 0;
    classMemberIDList = [];
    lastNames = [];
    currentClass = document.getElementById('classes').value;
    var teacherClassesRef = db.ref("users/" + uid + "/classes");
    teacherClassesRef.orderByKey().on('child_added', function(snapshot) { // for each teacher class
      var classRef = db.ref("classes/" + snapshot.key); // ref for teacher class
      classRef.on('value', function(classSnap) {
        if (classSnap.key == currentClass) { // check for matching class by id
          var teacherClassesRef = db.ref("users/" + uid + "/classes");
          var classMembersRef = db.ref("classes/" + snapshot.key + "/classMembers");
          classMembersRef.on('value', function(classMemberSnap) {
            classMemberSnap.forEach(function(classMember) {
              classSize++;
              classMemberIDList.push(classMember.key);
              var lastNameRef = db.ref("users/" + classMember.key + "/lastName");
              lastNameRef.on('value', function(lastNameSnap) {
                lastNames.push(lastNameSnap.val());
              });
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

  /* Takes in two class member IDs & compares the class member's last name
   * Sorts by last name ascending */
  function compareByLastName(classMemberIDA, classMemberIDB) {
    if (lastNames[classMemberIDList.indexOf(classMemberIDA)] < lastNames[classMemberIDList.indexOf(classMemberIDB)]) return -1;
    if (lastNames[classMemberIDList.indexOf(classMemberIDA)] > lastNames[classMemberIDList.indexOf(classMemberIDB)]) return 1;
    return 0;
  }
});