
var db = firebase.database();
var ref = db.ref();
var classSize;
var currentClass;
var uid;



function addRow() {
    $("#Emails tbody").append("<tr><td><input type='email' required /></td><td>" + "</td><td onclick='removeRow(this)'>remove x</td></tr>");
}

function addRow2() {
	$("#Emails2 tbody").append("<tr><td><input type='email' required /></td><td>" + "</td><td onclick='removeRow2(this)'>remove x</td></tr>");
}

function removeRow(ele) {
    $(ele).parent().remove();
}

function removeRow2(ele) {
	$(ele).parent().remove();
}

function sendRequest() {
	currentClass = document.getElementById("classes").value;
	
	if (currentClass.localeCompare("Initial") === 0) {
      alert("Pick a class before saving.");
      console.log("Pick a class before saving.");
    } else {

		var roster = [];

		$("#Emails tbody>tr").each(function(index, ele) {
			var tds = $(ele).find("td");
			h = {
				email: $(tds[0]).find("input").val()
			};
			roster.push(h);
			console.log("student :" + JSON.stringify(roster));
		});

		var classRef = db.ref("classes/" + currentClass);
		console.log("classRef: " + classRef);


		userRef = db.ref("users");
		
		for (var i = 0; i < roster.length; i++) {
			
			(function(foo) {
				var matchFound = false;
				// if email is valid check against emails in DB and if in there add to class
				if (ValidateEmail(roster[foo].email)) {
					userRef.once("value", function(snapShot) {
						snapShot.forEach(function(child) {
							var user = child.val();
							
							//console.log(child.key);
							console.log(user.email);
							
							//console.log(roster[foo].email);
							
							if (user.email.localeCompare(roster[foo].email) == 0) {
								console.log("Match");
								var studentKey = child.key;
								var classMemberRef = db.ref("classes/" + currentClass + "/classMembers");
							    var ungroupedRef = db.ref("classes/" + currentClass + "/ungrouped");
							    classMemberRef.update({
								    [studentKey]: true
							    });
							    ungroupedRef.update({
								 	[studentKey] : true
							    });
							    usersClassRef = db.ref("users/" + studentKey + "/classes" );
							    usersClassRef.update({
								    [currentClass]: true
							    });
								
								matchFound = true;
							}
						});
					}).then(function() {
						if (!matchFound) {
							// an entered email is not found
							alert(roster[foo].email + " is not in database.");
						}
					});
				// alert user that they entered a non valid email
				} else {
					alert(roster[i].email + " is not valid email");
				}
			}(i));
		}
		document.getElementById("Emails").innerHTML = "<thead><tr><th>Email</th><!--<th>Remove</th>--></tr></thead><tbody></tbody>";
	}
}

function sendRequest2() {
	currentClass = document.getElementById("classes").value;
	
	if (currentClass.localeCompare("Initial") === 0) {
      alert("Pick a class before removing.");
      console.log("Pick a class before removing.");
    } else {

		var roster = [];

		$("#Emails2 tbody>tr").each(function(index, ele) {
			var tds = $(ele).find("td");
			h = {
				email: $(tds[0]).find("input").val()
			};
			roster.push(h);
			console.log("student :" + JSON.stringify(roster));
		});

		var classRef = db.ref("classes/" + currentClass);
		console.log("classRef: " + classRef);


		userRef = db.ref("users");
		
		for (var i = 0; i < roster.length; i++) {
			
			(function(foo) {
				var matchFound = false;
				// if email is valid check against emails in DB and if in there add to class
				if (ValidateEmail(roster[foo].email)) {
					
					var classMemberRef = db.ref("classes/" + currentClass + "/classMembers");
					var ungroupedRef = db.ref("classes/" + currentClass + "/ungrouped");
					var groupRef = db.ref("classes/" + currentClass + "/groups");
								
								
					userRef.once("value", function(snapShot) {
						snapShot.forEach(function(child) {
							var user = child.val();
							
							//console.log(child.key);
							console.log(user.email);
							
							//console.log(roster[foo].email);
							
							if (user.email.localeCompare(roster[foo].email) == 0) {
								console.log("Match");
								var studentKey = child.key;
								
								var studentsClasses = db.ref("users/" + studentKey + "/classes");
								
								
								
								var classMemberRef = db.ref("classes/" + currentClass + "/classMembers");
							    var ungroupedRef = db.ref("classes/" + currentClass + "/ungrouped");
								var groupRef = db.ref("classes/" + currentClass + "/groups");
							    classMemberRef.child(studentKey).remove();
								
								groupRef.once('value', function(snap) {
									console.log("group hi");
									snap.forEach(function(child) {
										console.log("HI");
										console.log(child.key);
										var currentGroupRef = db.ref("groups/" + child.key + "/members");
										currentGroupRef.child(studentKey).remove();
										var userGroupRef = db.ref("users/" + studentKey + "/groups");
										userGroupRef.child(child.key).remove();
									});
								});
							    ungroupedRef.child(studentKey).remove();
							    usersClassRef = db.ref("users/" + studentKey + "/classes" );
							    usersClassRef.child(currentClass).remove();
								
								matchFound = true;
							}
						});
					}).then(function() {
						if (!matchFound) {
							// an entered email is not found
							alert(roster[foo].email + " is not in database.");
						}
					});
				// alert user that they entered a non valid email
				} else {
					alert(roster[i].email + " is not valid email");
				}
			}(i));
		}
		document.getElementById("Emails2").innerHTML = "<thead><tr><th>Email</th><!--<th>Remove</th>--></tr></thead><tbody></tbody>";
		changeRoster();
	}
}

function ValidateEmail(mail) 
{
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if(mail.match(mailformat))
  {
    return (true)
  }
    return (false)
}

function browserSupportFileUpload() {
	var isCompatible = false;
	if (window.File && window.FileReader && window.FileList && window.Blob) {
        isCompatible = true;
    }
    return isCompatible;
}

function upload(eve) {
	console.log("HI");
	if (!browserSupportFileUpload()) {
		alert("The File APIs are not fully supported with this browser!");
	} else {
		var data = null;
		var file = eve.target.files[0];
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(event) {
			var csvData = event.target.result;
			data = $.csv.toArrays(csvData);
			if (data && data.length > 0) {
				alert("Imported -" + data.length + " - rows successfully!");
				for (var i = 0; i < data.length; i++) {
					$("#Emails tbody").append("<tr><td><input type='email' value='" + data[i] + "' required /></td><td>" + "</td><td onclick='removeRow(this)'>remove x</td></tr>");
					console.log(data[i]);
				}
			} else {
				alert("No data to import!");
			}
		};
		reader.onerror = function() {
			alert("Unable to read " + file.fileName);
		};
	}
}

function upload2(eve) {
	console.log("HI");
	if (!browserSupportFileUpload()) {
		alert("The File APIs are not fully supported with this browser!");
	} else {
		var data = null;
		var file = eve.target.files[0];
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(event) {
			var csvData = event.target.result;
			data = $.csv.toArrays(csvData);
			if (data && data.length > 0) {
				alert("Imported -" + data.length + " - rows successfully!");
				for (var i = 0; i < data.length; i++) {
					$("#Emails2 tbody").append("<tr><td><input type='email' value='" + data[i] + "' required /></td><td>" + "</td><td onclick='removeRow(this)'>remove x</td></tr>");
					console.log(data[i]);
				}
			} else {
				alert("No data to import!");
			}
		};
		reader.onerror = function() {
			alert("Unable to read " + file.fileName);
		};
	}
}

