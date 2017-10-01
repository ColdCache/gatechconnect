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
    var classesRef = ref.child("Classes");
    classesRef.child(uid).child(titleToSend).set({
      "SomeStudentId": {
        "FirstName": "First",
        "LastName": "Last"
      }
    });
  });

  $('#groupSizeForm').submit(function(event) {
    var currentClass = document.getElementById('classes').value;
    var groupSizeToSend = $('#groupSizeTextBox').val();
  });
});