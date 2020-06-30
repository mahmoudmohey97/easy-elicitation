const util = require('util');
const con = require('../database');
const bcrypt = require('bcryptjs')
var sendemail = require('../sendmail') 
const crypto = require('crypto')
const query = util.promisify(con.query).bind(con);

module.exports.getClientById = async function (id) {
	let sql = "SELECT * FROM client WHERE clientId = ? ";
	let inserts = [id];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	if (output.length === 1)
		return output[0];
	return null;
};

module.exports.login = function (req, res) {
	var checkStatus = true;
	//get user firstly by email
	con.query("select * from client where email = \'" + req.body.email + "\'", function (err, result, field) {
		if (err) throw err;
		else if (result.length == 0) {
			res.send("Invalid email or password")
			checkStatus = false;
		}
		if (checkStatus) {
			//compare given password from req with the hashed password saved in database
			bcrypt.compare(req.body.password, result[0].password)
				.then(match => {
					if (!match) {
						res.send("Invalid email or password")
					}
					else { //Add admin name and email to the session
						req.session.user = result[0].name;
						req.session.email = result[0].email;
						req.session.cid = result[0].clientId;
						req.session.save()
						res.send("successfully loggedin")
					}
				})
		}
	});
}

module.exports.resetPassword = function (req, res) {
	var newpassword = req.body.password
	var email = req.body.email
	var token = req.body.token
	console.log(token)
	con.query("select * from client where email = \'" + email + "\' and resetPasswordToken = \'" + token + "\'", function (err, result, field) {
		if (err) throw err
		else if (result.length == 0) {
			res.send("no such user")
		}
		else {
			console.log("bye")
			var expireToken = result[0].expireToken;
			if (parseInt(expireToken) >= parseInt(Date.now().toString())) {
				bcrypt.hash(newpassword, 12)
					.then(hashedpassword => {
						con.query("update client set password = \'"
							+ hashedpassword + "\',resetPasswordToken = null , expireToken = null where email = \'" + email +
							"\'", function (err, result, field) {
								if (err) throw err
								res.send("password reset")
							})
					})
			}
		}
	})
}

module.exports.forgetPassword = function (req, res) {
	con.query("select * from client where email = \'" + req.query.email + "\'", function (err, result, field) {
		if (err) throw err;
		else if (result.length == 0) {
			res.send("user not found")
		}
		else {
			crypto.randomBytes(32, (err, buffer) => {
				if (err) console.log(err)
				else {
					const token = buffer.toString("hex")
					console.log(token)
					var email = req.query.email
					var expireToken = Date.now() + 3600000
					con.query("update client set resetPasswordToken = \'"
						+ token + "\',expireToken = \'" + expireToken + "\' where email = \'" + email +
						"\'", function (err, result, field) {
							if (err) throw err
							else {
								console.log("send email")
								var emailsubject = "please reset your password"
								var emailtext = "Please use the following link to reset your password \n"
									+ "http://localhost:3000/resetpassword/" + token + "?email=" + email + "&type=client"
								sendemail.sendToNewAdmin(email, emailsubject, emailtext)
								res.send("please check your email to reset password")
							}
						})

				}
			});
		}
	});
}