
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

    var roster = [];

    $("#Emails tbody>tr").each(function(index, ele) {
        var tds = $(ele).find("td");
        h = {
            email: $(tds[0]).find("input").val()
        };
        roster.push(h);
        console.log("student :" + JSON.stringify(roster));
    });

    currentClass = document.getElementById("classes").value;
    var classRef = db.ref("classes/" + currentClass);
    console.log("classRef: " + classRef);


    userRef = db.ref("users");

    userRef.on("value", function(snapShot) {
        snapShot.forEach(function(childSnapShot){
            var user = childSnapShot.val();

            console.log("email in db: " + JSON.stringify(user));
            // console.log("roster: " + roster[i].email);
            for (var i = 0; i < roster.length; i++) {
                if (user.email != roster[i].email) {
                    console.log("user is not in the system yet!");
                }
                console.log("student to add: " + roster[i].email);
                userRef.orderByChild('email').equalTo(roster[i].email).on("value", function(snapshot){
                   snapshot.forEach(function (child) {
                       console.log("childkey: " + child.key);
                       var studentKey = child.key;
                       var classMemberRef = db.ref("classes/" + currentClass + "/classMembers");
                       classMemberRef.update({
                           [studentKey]: true
                       });
                       usersClassRef = db.ref("users/" + studentKey + "/classes" );
                       usersClassRef.update({
                           [currentClass]: true
                       })
                   })
                });

            }


        });
    });




}
