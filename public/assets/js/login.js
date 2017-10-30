$(function() {
    $('#login-form-link').click(function(e) {
    	$("#login-form").delay(100).fadeIn(100);
 		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
	$('#register-form-link').click(function(e) {
		$("#register-form").delay(100).fadeIn(100);
 		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
});

document.getElementById('register-submit').addEventListener('click', function() {
	var auth = firebase.auth();
	// pull user inputed strings from doc elements
	var username_input = document.getElementById('register_username');
	var username = username_input.value;
	var email_input = document.getElementById('register_email');
	var email = email_input.value;
	var password_input = document.getElementById('register_password');
	var password = password_input.value;
	var confirm_password_input = document.getElementById('confirm-password');
	var confirm_password = confirm_password_input.value;
	var first_name_input = document.getElementById('register_first_name');
	var firstName = first_name_input.value;
	var last_name_input = document.getElementById('register_last_name');
	var lastName = last_name_input.value;
	var instructor_input = document.getElementById('instructor-radio');
	var student_input = document.getElementById('student-radio');
	if (instructor_input.checked) {
		var accountType = "instructor";
	} else if (student_input.checked) {
		var accountType = "student";
	} else {
		var accountType = "none";
	}

	// create new user in firebase auth
	var registerPromise = auth.createUserWithEmailAndPassword(email, confirm_password);
	registerPromise.then(function(user) {
		user.sendEmailVerification();
		alert("An email verification was sent to " + email + ".", 5000);
		window.location.replace("index");
		var userRef = database.ref("users/" + user.uid);
		userRef.set({
			displayName: username,
			email: email,
			accountType: accountType,
			firstName: register_first_name,
			lastName: register_last_name
		});
	}).catch(function(registerError) {
		alert(registerError.message);
	});
});


document.getElementById('login-submit').addEventListener('click', function() {
	// pull login data from form elements
	var email_input = document.getElementById('login_email');
	var email = email_input.value;
	var password_input = document.getElementById('login_password');
	var password = password_input.value;
	
	// signs in user through firebase auth
	var loginPromise = auth.signInWithEmailAndPassword(email, password);
	loginPromise.catch(function(error) {
		console.log(error);
	});
	loginPromise.then(function() {
		window.location.replace("index");
	});
});