


function addRow() {
    $("#Emails tbody").append("<tr><td><input type='email' required /></td><td>" + "</td><td onclick='removeRow(this)'>remove x</td></tr>");
}

function removeRow(ele) {
    $(ele).parent().remove();
}


function sendRequest() {
    // $("#Icon-Loading").addClass("glyphicon-spin");
    var roster = [];

    $("#Emails tbody>tr").each(function(index, ele) {
        var tds = $(ele).find("td");
        h = {
            email: $(tds[0]).find("input").val(),
            // permission: $(tds[1]).find("select").val()
        };

        roster.push(h);

    });
    var classesRef = database.ref("/classes/");
    classesRef.on("classID", function (snapshot) {
        var classKey = snapshot.val()
        console.log("classkey:" + classKey)
    })
    var classURL = ref.child("users/" + uid + "/classes" + classKey);
    var jsonObject = {
        siteUrl: "siteUrl",
        relativeUrl: "itemUrl",
        key: "ThisIsAKey",
        invitedUsers: roster
    };
    console.log({
        json: JSON.stringify(jsonObject)
    });
    $('#message').text("MessageSent:\n" + JSON.stringify(jsonObject, null, 4));

    //send json and have success and failure call backs on ajax
}
