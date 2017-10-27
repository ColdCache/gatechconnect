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
	var username_input = document.getElementById('username');
	var username = username_input.value;
	var email_input = document.getElementById('email');
	var email = email_input.value;
	var password_input = document.getElementById('password');
	var password = password_input.value;
	var confirm_password_input = document.getElementById('confirm-password');
	var confirm_password = confirm_password_input.value;

	// create new user in firebase auth
	var registerPromise = auth.createUserWithEmailAndPassword(email, confirm_password);
	registerPromise.then(function(user) {
		user.sendEmailVerification();
		alert("An email verification was sent to " + email + ".", 5000);
	}).catch(function(registerError) {
		console.log(registerError.message);
	});
})

document.getElementById('login-submit').addEventListener('click', function() {

})