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
    }).key;
    var teacherClassesRef = ref.child("users/" + uid + "/classes");
    teacherClassesRef.update({
      [classKey]: "true"
    });
  });

  // LOAD TEACHER'S CLASS LIST
  console.log(";__;");
  var dropDown = document.getElementById("classes");
  currentClass = dropDown.value;
  var teacherClassesRef = db.ref("users/" + uid + "/classes");
  console.log(teacherClassesRef.toString());
  teacherClassesRef.orderByKey().on('value', function(snapshot) {
    console.log(snapshot.exists());
    snapshot.forEach(function(childSnapshot) {
      console.log("The key should be: " + childSnapshot.val());
    });
    var classRef = db.ref("classes/" + snapshot.key + "/className");
    classRef.on('value', function(classSnap) {
      console.log(classSnap.val());
      var z = document.createElement("option");
      z.setAttribute("value", classSnap.val());
      var t = document.createTextNode(classSnap.val());
      z.appendChild(t);
      dropDown.appendChild(z);
      currentClass = dropDown.value;
    });
  });

  // LOAD TEACHER'S CLASS LIST
  /*var dropDown = document.getElementById("classes");
  currentClass = dropDown.value;
  var teacherClassesRef = db.ref("users/" + uid + "/classes");
  teacherClassesRef.orderByKey().on("child_added", function(snapshot) {
    var classRef = db.ref("classes/" + snapshot.key + "/className");
    classRef.on('value', function(classSnap) {
      var z = document.createElement("option");
      z.setAttribute("value", classSnap.val());
      var t = document.createTextNode(classSnap.val());
      z.appendChild(t);
      dropDown.appendChild(z);
      currentClass = dropDown.value;
    });
  });*/

  /*
  function changeGroup() {
    var currentClass = document.getElementById('classes').value;
    var currentGroup = document.getElementById('groups').value; // group name
    var config={apiKey: 'AIzaSyAhKnwZ_l8jwtMQFc7mBh30l96NLyZq03Q',
                authDomain: 'gatechconnect.firebaseapp.com',
                databaseURL: 'https://gatechconnect.firebaseio.com',
                projectId: 'gatechconnect',
                storageBucket: 'gatechconnect.appspot.com',
                messagingSenderId: '671330762711'};
    firebase.initializeApp(config, "privateFirebase2"); 
    var newDB = firebase.database(); 
    var newAuth = firebase.auth();  
    var currentUid = newAuth.currentUser.uid;
    var rowNumber = 1;
    var groupLoc = 'classes/' + currentUid + '/' + currentClass + '/grouped/' + currentGroup;
    var groupRef = newDB.ref(groupLoc);
    document.getElementById('grouped-students').innerHTML = '<th>First Name</th><th>Last Name</th>';
  
    var table = document.getElementById('groupedStudents');
    
    groupRef.orderByChild('LastName').on('child_added', function(snapshot) {
      var row = table.insertRow(rowNumber);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      cell1.innerHTML = snapshot.val().FirstName;
      cell2.innerHTML = snapshot.val().LastName;
      rowNumber++;
    });
  
    firebase.app('privateFirebase2').delete();
  }

  function changeRoster() {
    var currentClass = document.getElementById('classes').value;
    var config={apiKey: 'AIzaSyAhKnwZ_l8jwtMQFc7mBh30l96NLyZq03Q',
                authDomain: 'gatechconnect.firebaseapp.com',
                databaseURL: 'https://gatechconnect.firebaseio.com',
                projectId: 'gatechconnect',
                storageBucket: 'gatechconnect.appspot.com',
                messagingSenderId: '671330762711'};
    firebase.initializeApp(config, "privateFirebase"); 
    var newDB = firebase.database(); 
    var newAuth = firebase.auth();
    var currentUid = newAuth.currentUser.uid;
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
  
    firebase.app('privateFirebase').delete();
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
    var classesRef = ref.child("classes");
    var teacherClassesRef = ref.child("users/" + uid + "/classes");
    var classIDs = teacherClassesRef.getChildren();
    classIDs.forEach(function(item){
      console.log(item);
    });
    var currentClass = document.getElementById('classes').value;
    var numGroups = $('#numGroupsTextBox').val();
    var classSize = 0;
    

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