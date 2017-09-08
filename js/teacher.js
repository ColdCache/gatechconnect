$(document).ready(function () {
  $("tbody.connect-groups").sortable({
      connectWith: ".connect-groups",
      items: "> tr:not(:first)",
      appendTo: "parent",
      helper: "clone",
      cursor: "move",
      zIndex: 999990
  });
});