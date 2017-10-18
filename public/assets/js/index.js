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
  firebase.initializeApp(config); 
  var auth = firebase.auth();

  auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      console.log("Logged in!");
    } else {
      // No user is signed in.
      $("#dropdown").hide();
    }
  });
});