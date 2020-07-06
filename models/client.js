const util = require('util');
const con = require('../database');
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
module.exports.getClientByEmail = async function(email){
	let sql = "SELECT * FROM client WHERE email = ? ";
	let inserts = [email]
	sql= con.format(sql,inserts);
	const output = await query(sql);
	if (output.length === 1)
		return output[0];
	return null;
};
module.exports.getClientByEmailAndToken = async function(email,token){
	let sql = "select * from client where email = ? and resetPasswordToken = ? ";
	let inserts = [email,token]
	sql= con.format(sql,inserts);
	const output = await query(sql);
	if (output.length === 1)
		return output[0];
	return null;
}
module.exports.updatePasswordOfClient = async function(email,newpassword){
	let sql ="update client set password = ? , resetPasswordToken = null , expireToken = null where email = ? "
	let inserts = [newpassword,email]
	sql= con.format(sql,inserts);
	const output = await query(sql);
	return output;
} 
module.exports.updateTokenAndExpireTokenOfClient = async function(token,expiretoken,email){
	let sql = "update client set resetPasswordToken = ? , expireToken = ? where email = ? "
	let inserts = [token,expiretoken,email]
	sql = con.format(sql,inserts)
	const output = await query(sql);
	return output;
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
					var email = req.query.email
					var expireToken = Date.now() + 3600000
					con.query("update client set resetPasswordToken = \'"
						+ token + "\',expireToken = \'" + expireToken + "\' where email = \'" + email +
						"\'", function (err, result, field) {
							if (err) throw err
							else {
								var emailsubject = "please reset your password"
								var emailtext = "Please use the following link to reset your password \n"
									+ req.protocol + '://' + req.get('host') + "/resetpassword/" + token + "?email=" + email + "&type=client"
								sendemail.sendToNewAdmin(email, emailsubject, emailtext)
								res.redirect('/')
							}
						})
				}
			});
		}
	});
}