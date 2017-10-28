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
	$('#login-submit').click(function(e) {
		var email = $('#email').val();
		var password = $('#password').val();
		if (email == "" || password == "") {
			alert('Please fill in all fields.');
		} else {
			firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
				var errorCode = error.code;
				var errorMessage = error.message;
				alert(errorCode + ": " + errorMessage);
			});
		}
		e.preventDefault();
	});

	//TODO: add user to database, set email/username/password restrictions
	$('#register-submit').click(function(e) {
		var username = $('#username').val();
		var firstName = $('#first-name').val();
		var lastName = $('#last-name').val();
		var email = $('#register-email').val();
		var password = $('#register-password').val();
		var confirmPassword = $('#confirm-password').val();
		var professorRadio = $('#professor-radio').is(':checked');
		var studentRadio = $('#student-radio').is(':checked');
		if (username == "" || firstName == "" || lastName == "" || email == "" || password == "" || confirmPassword == "" || (!professorRadio && !studentRadio)) {
			alert('Please fill in all fields.');
		} else if (password != confirmPassword) {
			alert('Passwords do not match.');
		} else {
			firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
				var errorCode = error.code;
				var errorMessage = error.message;
				alert(errorCode + ": " + errorMessage);
			});
		}
		e.preventDefault();
	});
});