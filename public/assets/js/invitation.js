
var db = firebase.database();
var ref = db.ref();
var classSize;
var currentClass;
var uid;



function addRow() {
    $("#Emails tbody").append("<tr><td><input type='email' required /></td><td>" + "</td><td onclick='removeRow(this)'>remove x</td></tr>");
}

function removeRow(ele) {
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
			
			var matchFound = false;
			
			(function(foo) {
				// if email is valid check against emails in DB and if in there add to class
				if (ValidateEmail(roster[foo].email)) {
					userRef.once("value", function(snapShot) {
						snapShot.forEach(function(child) {
							var user = child.val();
							
							console.log(child.key);
							console.log(user.email);
							
							console.log(roster[foo].email);
							
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
