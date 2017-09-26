/*
 Firebase Authentication Working Example, JavaScript, CSS, and HTML crafted with love and lots of coffee.
 (c) 2016, Ron Royston, MIT License
 https://rack.pub
 
 1. ..................................................................INITIALIZE
    FIREBASE CONFIG
    INITIALIZE FIREBASE WEB APP
    REDEFINE GLOBAL DOCUMENT AS LOCAL DOC
 2. ...................................................................VARIABLES
    ACCOUNT PAGE
    ACK / EMAIL ACTION HANDLER PAGE
    PRIVATE PAGE
    PUBLIC PAGE
    SHARED
 3. .............................................................EVENT LISTENERS
    ACCOUNT PAGE
    PRIVATE PAGE
    SHARED
    SOCIAL MEDIA BUTTONS
 4. ............................................................FIREBASE METHODS
    INITIALIZE FIREBASE WEB APP
    FIREBASE AUTH STATE CHANGE METHOD
 5. ...................................................................FUNCTIONS
    ACCOUNT PAGE
    ACK / EMAIL ACTION HANDLER PAGE
    LOGIN PAGE
    PUBLIC PAGE 
    SHARED
 6. ............................................................REVEALED METHODS
    ADD NODES WITH DATA TO REALTIME DATABASE
*/

// var firebase = require('firebase');
/*

INITIALIZE

*/
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
  var db = firebase.database();
  var auth = firebase.auth();
  
  //REDEFINE DOCUMENT AS LOCAL DOC
  var doc = document;
  window.snackbarContainer = doc.querySelector('#toast');
  
  /*
  
  VARIABLES
  
  */

  //ACCOUNT PAGE
  var pwdUsersOnlyDiv = doc.getElementById('pwd-users-only-div');
  var newEmailInput = doc.getElementById('new-email-input');
  var newEmailSubmitButton = doc.getElementById('new-email-submit-button');
  var newPasswordSubmitButton = doc.getElementById('new-password-submit-button');
  var newEmailInputMdlTextfield = doc.getElementById('new-email-input-mdl-textfield');
  var deleteAccountButton = doc.getElementById('delete-account-button');
  var verifyPasswordInputMdlTextfield = doc.getElementById('verify-password-input-mdl-textfield');
  var verifyPasswordInput = doc.getElementById('verify-password-input');
  var verifyPasswordSubmitButton = doc.getElementById('verify-password-submit-button');
  var verifyPasswordEmailInput = doc.getElementById('verify-password-email-input');
  var verifyPasswordDiv = doc.getElementById('verify-password-div');

  //ACK PAGE
  var getArg = getArg();
  var mode = getArg['mode'];
  var oobCode = getArg['oobCode'];
  var ackActionsDiv = doc.getElementById('ack-actions-div');
  
  //LOGIN PAGE
  var registerCard = doc.getElementById('register-card');
  var registerButton = doc.getElementById('register-button');
  var loginButton = doc.getElementById('login-button');
  var submitButton = doc.getElementById('submit-button');
  var exitButton = doc.getElementById('exit-button');
  var loginCard = doc.getElementById('login-card');
  var logoutCard = doc.getElementById('logout-card');
  var noticeCard = doc.getElementById('notice-card');
  var privateCard = doc.getElementById('private-card');
  var secureCard = doc.getElementById('secure-card');
  var passwordInputMdlTextfield = doc.getElementById('password-input-mdl-textfield');
  var registrationInputPassword2MdlTextfield = doc.getElementById('registration-input-password2-mdl-textfield');
  var backButton = doc.getElementById('back-button');
  var providers = doc.getElementsByClassName('oauth-login-button');
  var registrationInputPassword = doc.getElementById('registration-input-password');
  var registrationInputPassword2 = doc.getElementById('registration-input-password2');
  var emailInput = doc.getElementById('email');
  var displayNameInput = doc.getElementById('display-name');
  

  //PRIVATE PAGE
  var nextButton = doc.getElementById('next-button');
  
  //PUBLIC PAGE
  var privatePageButton = doc.getElementById('private-page-button');
	
  // ACCOUNT PAGE
  var submitChangesButton = doc.getElementById('submit-changes-button');
  
  //SHARED
  var email = null;
  var provider = null;
  var displayName = null;
  var photoUrl = null;
  var uid = null;    
  var verifiedUser = false;
  var accountType = null;
  
  var signInButton = doc.getElementById('sign-in-button');
  var accountButton = doc.getElementById('account-menu-button');
  var helpButton = doc.getElementById('help-button');
  var drawer = doc.getElementsByClassName('mdl-layout__drawer')[0];
  var navLinks = drawer.getElementsByClassName('mdl-navigation')[0];

  //LOCAL STORAGE TEST
  Object.defineProperty(this, "ls", {
    get: function () { 
      var test = 'test';
      try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch(e) {
        return false;
      }
    }
  });

  /*
  
  EVENT LISTENERS
  
  */
  
  //ACCOUNT PAGE

  //enable pressing enter
  if(newEmailInputMdlTextfield){
    newEmailInputMdlTextfield.addEventListener("keyup", function(e) {
      e.preventDefault();
      if (e.keyCode == 13) {
        newEmailSubmitButton.click();
      }
    });
  }

  //PRIVATE PAGE
  if(nextButton){
    nextButton.addEventListener("click", function(){
      privateCard.style.display = "none";
      secureCard.style.display = "inline";
      
      db.ref('/markup/').once('value').then(function(snap) {
        if(snap.val()){
          secureCard.innerHTML = snap.val().secureData;
        } else {
          toast('/markup/secureData node does not exist!', 7000);
        }
      }, function(error) {
        // The Promise was rejected.
        toast(error);
      });
    });        
  }

  //SHARED  
  signInButton.addEventListener("click", function(){
    window.location = "/login";
  });

  helpButton.addEventListener("click", function(){
    window.location = "/help";
  }); 

  //SOCIAL MEDIA BUTTONS
  if(providers){
    for (var i = 0; i < providers.length; i++) {
      providers[i].addEventListener("click", fireAuth);
    }        
  }
  
  /*
  
  FIREBASE METHODS
  
  */

  //switch to detect how to handle ack page / email action handler arguments
  switch(mode) {
    case 'resetPassword':
      handleResetPassword(auth, oobCode);
      break;
    case 'recoverEmail':
      handleRecoverEmail(auth, oobCode);
      break;
    case 'verifyEmail':
      handleVerifyEmail(auth, oobCode);
      break;
  }  

  //FIREBASE AUTH STATE CHANGE METHOD
  auth.onAuthStateChanged(function(user) {
    if (user) {
      provider = user.providerData[0].providerId ? user.providerData[0].providerId : null;
      verifiedUser = user.emailVerified ? user.emailVerified : null;
      displayName = user.displayName ? user.displayName : null;
      email = user.email ? user.email : null;
      photoUrl = user.photoURL ? user.photoURL : null;
      uid = user.uid ? user.uid : null;
      
      switch(provider) {
        case 'facebook':
        case 'github':
        case 'google':
        case 'twitter':
          break;
        case 'password':
          if(!verifiedUser){
            
            if(loginCard && logoutCard && noticeCard){
              loginCard.style.display = "none";
              logoutCard.style.display = "none";
              noticeCard.style.display = "inline";              
            }
            
            //kick unvalidated users to the login page
            redirect('login');
            
            //break out of function logic here
            return;
          }
          break;
          //var isAnonymous = user.isAnonymous;
      }
      
      verifiedUser = true;
      
      if(loginCard && logoutCard && noticeCard){
        loginCard.style.display = "none";
        logoutCard.style.display = "inline";
        noticeCard.style.display = "none";                
      }
      
      if(deleteAccountButton){
        // any logged in user can delete their account
        deleteAccountButton.disabled = false;
        
        deleteAccountButton.addEventListener("click", function(){
          deleteAccount();
        });
      }
      
      if(pwdUsersOnlyDiv){
        if(provider == "password"){
          if(verifiedUser){
            // display account update options
            pwdUsersOnlyDiv.style.display = "inline";
           
            //enable email submit button only if input not empty
            newEmailInputMdlTextfield.addEventListener("input", function() {
              if (this != null) {
                newEmailSubmitButton.disabled = false;
              }
            });
            
            newEmailSubmitButton.addEventListener("click", function(){
              var newEmailInputArg = newEmailInput.value;
              newEmail(newEmailInputArg);
            });
            
            newPasswordSubmitButton.addEventListener("click", function(){
              newPasswordViaEmailReset(email);
            });
            
          } else {
            // tell them to verify first
          }
        }        
      }
      //ENABLE BUTTON AND LINKS
      if(privatePageButton){
        privatePageButton.disabled = false;
      }
      addPrivateLinkToDrawer();
      
    //USER NOT SIGNED IN
    } else {
      
      //NULLIFY SHARED USER VARIABLES
      provider = null;
      verifiedUser = null;
      displayName = null;
      email = null;
      photoUrl = null;
      uid = null;
      
      //DISABLE BUTTON AND LINKS
      if(privatePageButton){
        privatePageButton.disabled = true;
      }
      removePrivateLinkFromDrawer();
      
      if(loginCard && logoutCard && noticeCard){
        loginCard.style.display = "inline";
        logoutCard.style.display = "none";
        noticeCard.style.display = "none";         
      }
    }
    
    //ADJUST USER CHIP IN ANY CASE
    loadAccountChip();
  });

  /*
  
  FUNCTIONS
  
  */
  
  // ACCOUNT PAGE FUNCTIONS
  
  function deleteAccount(){
    auth.currentUser.delete().then(function(value) {
      deleteAccountButton.disabled = true;
      toast('Bye Bye',7000);
    }).catch(function(error) {
      toast(error.message,7000);
    });     
  }

  function newEmail(newEmail){
    user = auth.currentUser;
    user.updateEmail(newEmail).then(function(value) {
      user.sendEmailVerification().then(function(value) {
        toast('Check ' + user.email + ' to validate change.',7000);
        signout();
      }).catch(function(error) {
        toast(error.message,7000);
      });
    }).catch(function(error) {
      toast(error.message,7000);
    });
  }

  //UPDATE PASSWORD WITHOUT EMAIL VERIFICATION
  function newPassword(newPassword){
    //updatePassword(newPassword)
    auth.currentUser.updatePassword(newPassword).then(function(value) {
      toast('Password Updated',7000);
    }).catch(function(error) {
      toast(error.message,7000);
    });    
  }

  function newPasswordViaEmailReset(email){
    auth.sendPasswordResetEmail(email).then(function(value) {
      toast('Check email to complete action',7000);
    }).catch(function(error) {
      toast(error.message,7000);
    });    
  }

  //ACK PAGE / EMAIL ACTION HANDLER FUNCTIONS
  function handleResetPassword(auth, oobCode) {
    var accountEmail;

    // Verify the password reset code is valid.
    auth.verifyPasswordResetCode(oobCode).then(function(email) {
      var accountEmail = email;
      
      verifyPasswordDiv.style.display = "inline";
      verifyPasswordEmailInput.value = accountEmail;
      verifyPasswordEmailInput.parentNode.classList.add('is-dirty');
      
      var btn = doc.createElement("button");
      var txt = doc.createTextNode("Submit");
      btn.appendChild(txt);
      btn.className = "mdl-button mdl-js-button mdl-js-ripple-effect";
      btn.disabled = true;
      btn.id = "verify-password-submit-button";
      
      ackActionsDiv.appendChild(btn);
      
      verifyPasswordSubmitButton = doc.getElementById('verify-password-submit-button') ;          
      //enable email submit button
      verifyPasswordInputMdlTextfield.addEventListener("input", function() {
        if (this != null) {
          verifyPasswordSubmitButton.disabled = false;
        }
      });
      
      //enable pressing enter
      verifyPasswordInputMdlTextfield.addEventListener("keyup", function(e) {
        e.preventDefault();
        if (e.keyCode == 13) {
          verifyPasswordSubmitButton.click();
        }
      });
      
      verifyPasswordSubmitButton.addEventListener("click", function(){
        var newPassword = verifyPasswordInput.value;
        verifyPassword(oobCode,newPassword);
      });
      
    }).catch(function(error) {
      toast(error.message,7000);
    });
  }

  function verifyPassword(oobCode,newPassword){
    auth.confirmPasswordReset(oobCode, newPassword).then(function(resp) {
      // Password reset has been confirmed and new password updated.
      // TODO: Display a link back to the app, or sign-in the user directly
      // if the page belongs to the same domain as the app:
      auth.signInWithEmailAndPassword(email, newPassword);
      loadAccountChip();
      toast('Password Changed',7000);
    }).catch(function(error) {
      // Error occurred during confirmation. The code might have expired or the
      // password is too weak.
      toast(error.message,7000);
    });
  }                

  function handleRecoverEmail(auth, oobCode) {
    var restoredEmail = null;
    // Confirm the action code is valid.
    auth.checkActionCode(oobCode).then(function(info) {
      // Get the restored email address.
      restoredEmail = info['data']['email'];
      // Revert to the old email.
      return auth.applyActionCode(oobCode);
    }).then(function() {
      toast('Account email change undone',7000);
      auth.sendPasswordResetEmail(restoredEmail).then(function() {
        // Password reset confirmation sent. Ask user to check their email.
      }).catch(function(error) {
        // Error encountered while sending password reset code.
        toast(error.message,7000);
      });
    }).catch(function(error) {
      // Invalid code.
      toast(error.message,7000);
    });
  }
    
  function handleVerifyEmail(auth, oobCode) {
    // Try to apply the email verification code.
    auth.applyActionCode(oobCode).then(function(resp) {
      // js doesn't see email verified yet so we short circuit loadAccountChip.
      loadAccountChip('good');
      toast('Email address has been verified',9000);
      addPrivateLinkToDrawer();
    }).catch(function(error) {
      // Code is invalid or expired. Ask the user to verify their email address again.
      toast(error.message);
    });
  }

  function getArg(param) {
    var vars = {};
    window.location.href.replace( location.hash, '' ).replace( 
      /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
      function( m, key, value ) { // callback
        vars[key] = value !== undefined ? value : '';
      }
    );
    if ( param ) {
      return vars[param] ? vars[param] : null;	
    }
    return vars;
  }
  
  // LOGIN PAGE FUNCTIONS
  
  //FIRE OAUTH POPUPS
  function fireAuth(){
    switch (this.id) {
      case 'facebook-button':
        provider = new firebase.auth.FacebookAuthProvider();
        break;
      case 'github-button':
        provider = new firebase.auth.GithubAuthProvider();
        break;
      case 'google-button':
        provider = new firebase.auth.GoogleAuthProvider();
        break;
      case 'twitter-button':
        provider = new firebase.auth.TwitterAuthProvider();
        break;
    }                    
    authAction();
  }
  
  if(loginButton){
    loginButton.addEventListener("click", function(){
      var usernameInput = doc.getElementById('username-input');
      var passwordInput = doc.getElementById('password-input');
      var email = usernameInput.value;
      var password = passwordInput.value;

      if (!email) {
        toast('Username Required');
        usernameInput.focus();
        usernameInput.parentNode.classList.add('is-dirty');                        
      } else if (!password){
        toast('Password Required');
        passwordInput.focus();
        passwordInput.parentNode.classList.add('is-dirty');                        
      } else {
        loginUsername(email,password);
      }
    });
  }

  if(passwordInputMdlTextfield){
    //ENABLE LOGIN BUTTON
    passwordInputMdlTextfield.addEventListener("input", function() {
      if (this != null) {
        loginButton.disabled = false;
      }
    });
    //PRESS ENTER
    passwordInputMdlTextfield.addEventListener("keyup", function(e) {
      e.preventDefault();
      if (e.keyCode == 13) {
        loginButton.click();
      }
    });
  }

  //PRESS ENTER
  if(registrationInputPassword2MdlTextfield){
    registrationInputPassword2MdlTextfield.addEventListener("keyup", function(e) {
      e.preventDefault();
      if (e.keyCode == 13) {
        submitButton.click();
      }
    });
  }

  if(registerButton){
    registerButton.addEventListener("click", function(){
      loginCard.style.display = "none";
      registerCard.style.display = "inline";
    });        
  }

  if(exitButton){
    exitButton.addEventListener("click", function(){
      signout();
    });        
  }

  if(backButton){
    backButton.addEventListener("click", function(){
      loginCard.style.display = "inline";
      registerCard.style.display = "none";
    });        
  }

  if(submitButton){
    submitButton.addEventListener("click", function(){
      var email = emailInput.value;
      var displayName = displayNameInput.value;
      var password = registrationInputPassword2.value;
      registerPasswordUser(email,displayName,password);
    });        
  }

  function loginUsername(email,password){
    auth.signInWithEmailAndPassword(email, password).then(function(value) {
      //NEED TO PULL USER DATA?
	  putNewUser();
	  pullUserData();
      redirect("/");
    }).catch(function(error) {
      toast(error.message,7000);
    });
  }

  function pullUserData() {
 	  var userId = firebase.auth().currentUser.uid;
	  /*
	  // pull account type from database
	  firebase.database().ref().child('users/' + userId).once('value').then(function(snapshot) {
		 accountType = snapshot.val().accountType; 
	  });
	  */
	  firebase.database.ref('users/' + userId).once('value').then(function(snapshot) {
		displayName = (snapshot.val().displayName);
		email = (snapshot.val().email);
  		accountType = (snapshot.val().accountType);
		console.log(accountType);
		demo.update('users/' + userId, 'test', accountType);
	 });
  }

  function promptDuplicateName (name){
    toast('Display Name Already Taken.  Please choose another.', 7000);
    displayNameInput.focus();
    displayNameInput.parentNode.classList.add('is-dirty');
  }

  if(registrationInputPassword2){
    registrationInputPassword2.oninput=function(){
      check(this);
    };        
  }

  function check(input) {
    if (input.value != registrationInputPassword.value) {
      input.setCustomValidity('Passwords Must Match');
      submitButton.disabled = true;
    } else {
      // VALID INPUT - RESET ERROR MESSAGE
      input.setCustomValidity('');
      submitButton.disabled = false;
    }
  }

  function authAction(){
    auth.signInWithPopup(provider).then(function(result) {
      redirect('/');
    }).catch(function(error) {
      // Handle Errors here.
      toast(error.message);
    });                    
  }
  
  function registerPasswordUser(email,displayName,password,photoURL){
    var user = null;
    //NULLIFY EMPTY ARGUMENTS
    for (var i = 0; i < arguments.length; i++) {
      arguments[i] = arguments[i] ? arguments[i] : null;
    }
    auth.createUserWithEmailAndPassword(email, password)
    .then(function () {
      user = auth.currentUser;
      user.sendEmailVerification();
    })
    .then(function () {
      user.updateProfile({
        displayName: displayName,
        photoURL: photoURL
      });
    })
    .catch(function(error) {
      toast(error.message,7000);
    });
    toast('Validation link was sent to ' + email + '.', 7000);
    registerCard.style.display = "none";
  }

  //CAN ADD USER DATA TO REALTIME DATABASE
  function putNewUser (){
    if(displayName){
      db.ref('/users/' + uid).once('value').then(function(snap) {
        if(snap.val()){
          //exit bcs user already exists
          return;
        } else {
          // save the user's profile into the database
          db.ref('/users/' + uid).set({
            displayName: displayName,
            email: email,
            photoUrl: photoUrl,
            provider: provider
          });
        }
      }, function(error) {
        // The Promise was rejected.
        toast(error);
      });
    }
  }
	
	// archived version
	function putNewUserDefunct (){
    if(displayName){
      db.ref('/users/' + uid).once('value').then(function(snap) {
        if(snap.val()){
          //exit bcs user already exists
          return;
        } else {
          // save the user's profile into the database
          db.ref('/users/' + uid).set({
            displayName: displayName,
            email: email,
            photoUrl: photoUrl,
            provider: provider
          });
        }
      }, function(error) {
        // The Promise was rejected.
        toast(error);
      });
    }
  }

  //DETECTS DUPLICATE DISPLAY NAMES IN USERS BRANCH OF REALTIME DATABASE
  function displayNameExists (email, displayName, password){
    var users = db.ref('users');
    var duplicate = users.orderByChild('displayName').equalTo(displayName);
    duplicate.once('value').then(function(snap) {
      if(snap.val()){
        promptDuplicateName(displayName);
      } else {
        email = email;
        displayName = displayName;
        if(ls){
          localStorage.setItem('displayName', displayName);
        }else{
          // unavailable
        }                
        demoLogin.registerUsername(password);
      }
    }, function(error) {
      // The Promise was rejected.
      toast(error);
    });
  }

  /*
  
  PUBLIC PAGE FUNCTIONS
  
  */

  
  if(privatePageButton){
    privatePageButton.addEventListener("click", function(){
      redirect("/private");
    });        
  }
	
  /*
  
  ACCOUNT SETTINGS PAGE FUNCTIONS
  
  */
  // submit changes button listener
  if(submitChangesButton){
	  submitChangesButton.addEventListener("click", function(){
		  var userId = firebase.auth().currentUser.uid;
		   
		  // pull form elements from document
		  var studentRadioInput = doc.getElementById('student-radio');
		  var instructorRadioInput = doc.getElementById('instructor-radio');
		  var newAccountType = null;
		  if (studentRadioInput.checked) {
			  newAccountType = 'student';
		  } else if (instructorRadioInput.checked) {
			  newAccountType = 'instructor';
		  }
		  // pull values from doc elements
		  var newDisplayName = displayNameInput.value;
		  var newEmail = emailInput.value;
		  var user = {
				displayName: newDisplayName,
				email: newEmail,
				accountType: newAccountType
		  };
		  
		  // check for data validity
		  if (!newDisplayName || !newDisplayName.length){
			   user.displayName = displayName;
		  }
		  if (!newEmail || !newEmail.length){
			  user.email = email;
		  }
		  if (!newAccountType || !newAccountType.length){
			  user.accountType = accountType;
		  }
		  
		  // update firebase database
		  firebase.database().ref().child('users/' + userId).update({
			  displayName: user.displayName,
			  email: user.email,
			  accountType: user.accountType
		  }).
		  then(function() {
      		console.log('Update Ran Successfully');
    	  });
    });
  }
	/*
  
  SHARED FUNCTIONS FUNCTIONS
  
  */

  // TOP RIGHT USER ELEMENT SWITCH
  function loadAccountChip(msg){
    accountButton.innerHTML = '';

    //MSG SHORT CIRCUIT PROVIDES MEMBER ACCESS UPON EMAIL VERIFIED PAGE LOAD
    if(msg){
      if(displayName){
        signInButton.style.display = "none";
        accountButton.style.display = "inline";        
      } else {
        signInButton.style.display = "inline";
        accountButton.style.display = "inline";         
      }
      
    } else {
      if(!uid || !displayName){
        signInButton.style.display = "inline";
        accountButton.style.display = "none";
      } else {
        signInButton.style.display = "none";
        accountButton.style.display = "inline";            
      }      
    }
      
    if(msg){
    
    } else {
      if(!verifiedUser && provider == "password"){
        signInButton.style.display = "none";
        return;
      }      
    }
    
    accountButton.innerHTML = '<span> ' + displayName + ' </span><ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="account-menu-button"><li class="mdl-menu__item" id="account-settings-button">Account Settings</li><li class="mdl-menu__item" id="sign-out-button">Logout</li></ul>';
    
    var signOutButton = doc.getElementById('sign-out-button');
    var accountSettingsButton = doc.getElementById('account-settings-button');
    
    signOutButton.addEventListener("click", function(){
      signout();
    });
    
    accountSettingsButton.addEventListener("click", function(){
      redirect ("/account");
    });
    
    window.componentHandler.upgradeAllRegistered();
  }
  
  // SIGN OUT
  function signout (){
    auth.signOut().then(function() {
      accountButton.style.display = "none";
      signInButton.style.display = "inline";
      toast('Signed Out');
      redirect('login');
    }, function(error) {
      toast('Sign out Failed');
    });       
  }

  function addPrivateLinkToDrawer(){
    if(!doc.getElementById('profile-link')){
      var icon = doc.createElement("i");
      var iconText = doc.createTextNode('portrait');
      var anchorText = doc.createTextNode(' Profile');
      icon.classList.add('material-icons');
      icon.appendChild(iconText);
  
      var profileLink = doc.createElement("a");
      profileLink.classList.add('mdl-navigation__link');
      profileLink.href = "../profile";
      profileLink.id = "profile-link";
      profileLink.appendChild(icon);
      profileLink.appendChild(anchorText);
  
      var anchorList = navLinks.getElementsByClassName('mdl-navigation__link')[1];
      navLinks.insertBefore(profileLink, anchorList);
    }
	  
	  if(!doc.getElementById('courses-link')){
      var icon = doc.createElement("i");
      var iconText = doc.createTextNode('pages');
      var anchorText = doc.createTextNode(' Courses');
      icon.classList.add('material-icons');
      icon.appendChild(iconText);
  
      var coursesLink = doc.createElement("a");
      coursesLink.classList.add('mdl-navigation__link');
      coursesLink.href = "../courses";
      coursesLink.id = "courses-link";
      coursesLink.appendChild(icon);
      coursesLink.appendChild(anchorText);
  
      var anchorList = navLinks.getElementsByClassName('mdl-navigation__link')[2];
      navLinks.insertBefore(coursesLink, anchorList);
	  
	  // show respective pages depending on account type
	  if (accountType) {
		  if (accountType == "student") {
		  	addStudentLinksToDrawer();
	  	  } else if (accountType == "instructor") {
		  	addTeacherLinksToDrawer();
	  	  }
	  }
    }
  }
	
  // function to add teacher specific links to side nav bar (replicated from source)
  function addTeacherLinksToDrawer(){
    if(!doc.getElementById('students-link')){
      var icon = doc.createElement("i");
      var iconText = doc.createTextNode('people');
      var anchorText = doc.createTextNode(' Students');
      icon.classList.add('material-icons');
      icon.appendChild(iconText);
  
      var studentsLink = doc.createElement("a");
      studentsLink.classList.add('mdl-navigation__link');
      studentsLink.href = "../students";
      studentsLink.id = "students-link";
      studentsLink.appendChild(icon);
      studentsLink.appendChild(anchorText);
  
      var anchorList = navLinks.getElementsByClassName('mdl-navigation__link')[3];
      navLinks.insertBefore(studentsLink, anchorList);
    }
  }
	
  function addStudentLinksToDrawer(){
    if(!doc.getElementById('groups-link')){
      var icon = doc.createElement("i");
      var iconText = doc.createTextNode('recent-actors');
      var anchorText = doc.createTextNode(' Groups');
      icon.classList.add('material-icons');
      icon.appendChild(iconText);
  
      var groupsLink = doc.createElement("a");
      groupsLink.classList.add('mdl-navigation__link');
      groupsLink.href = "../groups";
      groupsLink.id = "groups-link";
      groupsLink.appendChild(icon);
      groupsLink.appendChild(anchorText);
  
      var anchorList = navLinks.getElementsByClassName('mdl-navigation__link')[3];
      navLinks.insertBefore(groupsLink, anchorList);
    }

    if(!doc.getElementById('surveys-link')){
      var icon = doc.createElement("i");
      var iconText = doc.createTextNode('clipboard_text');
      var anchorText = doc.createTextNode(' Surveys');
      icon.classList.add('material-icons');
      icon.appendChild(iconText);
  
      var surveysLink = doc.createElement("a");
      surveysLink.classList.add('mdl-navigation__link');
      surveysLink.href = "../surveys";
      surveysLink.id = "surveys-link";
      surveysLink.appendChild(icon);
      surveysLink.appendChild(anchorText);
  
      var anchorList = navLinks.getElementsByClassName('mdl-navigation__link')[4];
      navLinks.insertBefore(surveysLink, anchorList);
    }
  }

  function removePrivateLinkFromDrawer(){
    var profileLink = doc.getElementById('profile-link');
    if(profileLink){
      profileLink.parentNode.removeChild(profileLink);
    }
	var coursesLink = doc.getElementById('courses-link');
    if(coursesLink){
      coursesLink.parentNode.removeChild(coursesLink);
    }
	var studentsLink = doc.getElementById('students-link');
    if(studentsLink){
      studentsLink.parentNode.removeChild(studentsLink);
    }
	var surveysLink = doc.getElementById('surveys-link');
    if(surveysLink){
      surveysLink.parentNode.removeChild(surveysLink);
    }
  }
  
  function redirect(path){
    var baseURL = window.location.protocol + '//' + window.location.host;
    console.log("baseURL is " + baseURL);
    var hasSlash = path.charAt(0) == '/';
    
    if(path == '/') {
      path = baseURL;
    }
    
    if(!hasSlash){
      path = '/' + path;
    }
    
    var onThisPage = (window.location.href.indexOf(baseURL + path) > -1);
    
    if (!onThisPage) {
      //redirect them to login page for message
       location = path;
    }
  }

  //TOAST
  function toast (msg,timeout){
    if(!timeout){timeout = 2750}
    var data = {
      message: msg,
      timeout: timeout
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
  };

// END
}, false);

/*

REVEALED METHODS

*/

//REVEALED METHOD TO ADD NODES WITH DATA TO REALTIME DATABASE
//eg, demo.update('mynode','myKey','myValue')
var demo = (function() {
  var pub = {};
  pub.update = function (node,key,value){
    var ref = firebase.database().ref('/');
    var obj = {};
    obj[key] = value;
    ref.child(node).update(obj)
    .then(function() {
      console.log('Update Ran Successfully');
    });       
  }
  //API
  return pub;
}());

// test using test.read('node', 'key')
var test = (function() {
  var pub = {};
  var userId = firebase.auth().currentUser.uid;
  pub.read = function (node, key){
    var ref = firebase.database().ref('/');
    var obj = {};
    var value = ref.child(node).read(node, key);
    /* Read 
	return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
  	var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
  	// ...
	});
*/
  }
  return pub;
}());

// call using userData.read(property)
var userData = (function() {
	var pub = {};
	var userId = firebase.auth().currentUser.uid;
	pub.read = function(prop) {
		var ref = firebase.database().ref('users/' + userId + '/' + prop);
		var obj = {};
		var value = ref.once('value').then(function(snapshot) {
			pub = snapshot.val();
		});
	}
	return pub;
}());