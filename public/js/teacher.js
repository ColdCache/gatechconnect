document.addEventListener('DOMContentLoaded', function() {
  $("tbody.connect-groups").sortable({
    connectWith: ".connect-groups",
    items: "> tr:not(:first)",
    appendTo: "parent",
    helper: "clone",
    cursor: "move",
    zIndex: 999990
  });

  $('#addClass').submit(function(event){
    $(this).find("#className").prop('disabled', true);
    console.log("submit to Firebase");
    var titleToSend = $('#classNameTextBox').val();
    var newClass = {
      titleToSend: []
    }
    var classesRef = ref.child('Classes');
    var classesRef = classesRef.push();
    console.log('Class key', classesRef.key);
    var classRef = classesRef.push(newClass);
    console.log(classesRef);
  });
});