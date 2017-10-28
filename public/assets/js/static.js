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
var database = firebase.database();
var user = auth.currentUser;
var uid = user ? user.uid : null;

document.addEventListener('DOMContentLoaded', function() {
  $('#footer').load('footer.html');
  // Wait until navigation bar loads before changing div visibility
  $('#navbar').load('navbar.html', function() {
    auth.onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var uid = auth.currentUser.uid;
        accountTypeRef = database.ref('/users/' + uid).once('value').then(function(snapshot) {
          var accountType = snapshot.val().accountType;
          if (accountType == 'instructor') {
            $("#teacher-dropdown").show();
            $("#student-dropdown").hide();
          } else if (accountType == 'student') {
            $("#student-dropdown").show();
            $("#teacher-dropdown").hide();
          }
        }).catch(function(readError) {
          console.log(readError);
        });

        console.log("Logged in!");
        $("#sign-in").hide();
        $("#sign-out").show();
      } else {
        // No user is signed in.
        console.log("NOT logged in!");
        $("#sign-in").show();
        $("#teacher-dropdown").hide();
        $("#student-dropdown").hide();
        $("#sign-out").hide();
      }
    });
  });
});

// signout on click
$("#signout").click(function() {
  console.log("signing out");
  auth.signOut().then(function() {
    console.log("User successfully signed out.");
  }).catch(function(error) {
    alert(error.message);
  });
});
