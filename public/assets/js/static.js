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
  var auth = firebase.auth();

  $('#footer').load('footer.html');
  
  // Wait until navigation bar loads
  $('#navbar').load('navbar.html', function() {
    $('#sign-out').click(function() {
      auth.signOut().then(function() {
        alert('Successfully signed out.');
      }, function(error) {
        alert('Error signing out.');
      });
    });

    auth.onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        console.log("Logged in!");
        $("#sign-in").hide();
        $("#teacher-dropdown").show();
        $("#student-dropdown").show();
        $("#sign-out").show();
      } else {
        // No user is signed in.
        console.log("NOT logged in!");
        $("#teacher-dropdown").hide();
        $("#student-dropdown").hide();
        $("#sign-out").hide();
        $("#sign-in").show();
      }
    });
  });
});