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


document.addEventListener('DOMContentLoaded', function() {
  $('#footer').load('footer.html');
  // Wait until navigation bar loads before changing div visibility
  $('#navbar').load('navbar.html', function() {
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
        $("#sign-in").show();
        $("#teacher-dropdown").hide();
        $("#student-dropdown").hide();
        $("#sign-out").hide();
      }
    });
  });
});

$("#signout").click(function() {
  console.log("signing out");
  auth.signOut().then(function() {
    console.log("User successfully signed out.");
  }).catch(function(error) {
    alert(error.message);
  });
});