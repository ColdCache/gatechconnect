
'use strict';
const nodemailer = require('nodemailer');
var db = firebase.database();
var ref = db.ref();
var classSize;
var currentClass;
var uid;

function addRow() {
    $("#Emails tbody").append("<tr><td><input type='email' required /></td><td>" + "</td><td onclick='removeRow(this)'>remove x</td></tr>");
}

function removeRow(ele) {
    $(ele).parent().remove();
}

function sendRequest() {
	currentClass = document.getElementById("classes").value;
	
	if (currentClass.localeCompare("Initial") === 0) {
      alert("Pick a class before saving.");
      console.log("Pick a class before saving.");
    } else {

		var roster = [];

		$("#Emails tbody>tr").each(function(index, ele) {
			var tds = $(ele).find("td");
			h = {
				email: $(tds[0]).find("input").val()
			};
			roster.push(h);
			console.log("student :" + JSON.stringify(roster));
		});

		var classRef = db.ref("classes/" + currentClass);
		console.log("classRef: " + classRef);


		userRef = db.ref("users");
		
		for (var i = 0; i < roster.length; i++) {
			
			var matchFound = false;
			
			(function(foo) {
				// if email is valid check against emails in DB and if in there add to class
				if (ValidateEmail(roster[foo].email)) {
					userRef.once("value", function(snapShot) {
						snapShot.forEach(function(child) {
							var user = child.val();
							
							console.log(child.key);
							console.log(user.email);
							
							console.log(roster[foo].email);
							
							if (user.email.localeCompare(roster[foo].email) == 0) {
								console.log("Match");
								var studentKey = child.key;
								var classMemberRef = db.ref("classes/" + currentClass + "/classMembers");
							    var ungroupedRef = db.ref("classes/" + currentClass + "/ungrouped");
							    classMemberRef.update({
								    [studentKey]: true
							    });
							    ungroupedRef.update({
								 	[studentKey] : true
							    });
							    usersClassRef = db.ref("users/" + studentKey + "/classes" );
							    usersClassRef.update({
								    [currentClass]: true
							    });
								
								matchFound = true;
							}
						});
					}).then(function() {
						if (!matchFound) {
							// an entered email is not found
							var msg = roster[foo].email + " is not a registered email. Would you like to send them a class link via email?";
							var sendEmail = confirm(msg);
							if (sendEmail) {
								sendJoinClassLink();
							}
						}
					});
				// alert user that they entered a non valid email
				} else {
					alert(roster[i].email + " is not a valid email");
				}
			}(i));
		}
	}
}

function ValidateEmail(mail) 
{
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if(mail.match(mailformat))
  {
    return (true)
  }
    return (false)
}

function sendJoinClassLink() {
	nodemailer.createTestAccount((err, account) => {
		// create reusable transporter object using the default SMTP transport
		let transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: account.user, // generated ethereal user
				pass: account.pass  // generated ethereal password
			}
		});
	
		// setup email data with unicode symbols
		let mailOptions = {
			from: '"Fred Foo 👻" <georgiatechconnectapp@gmail.com>', // sender address
			to: 'georgiatechconnectapp@gmail.com', // list of receivers
			subject: 'Hello ✔', // Subject line
			text: 'Hello world?', // plain text body
			html: '<b>Hello world?</b>' // html body
		};
	
		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}
			console.log('Message sent: %s', info.messageId);
			// Preview only available when sending through an Ethereal account
			console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	
			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
			// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
		});
	});

	/*var email = 'georgiatechconnectapp@gmail.com';
	var teacherName = 'CoolestTeacher';
	var className = 'CS1100';
	var classID = '-somefakeclassID';
	const mailOptions = {
		from: `${APP_NAME} <georgiatechconnectapp@gmail.com>`,
		to: email
	};

	mailOptions.subject = 'Join Class Link for ${APP_NAME}!';
	mailOptions.text = 'Hey student! Instructor ${teacherName} is sending you a link to join the class ${className} registered on ${APP_NAME}.';
	mailOptions.text += 'Before you can join a class, you must login or register to an account here: https://gatechconnect.firebaseapp.com/login';
	mailOptions.text += 'Once you are registered and/or logged in, you can join your class by following this link: https://gatechconnect.firebaseapp.com/join-class/${classID}';
	return mailTransport.sendMail(mailOptions).then(() => {
		console.log('New join class link email sent to:', email);
	});*/
}
