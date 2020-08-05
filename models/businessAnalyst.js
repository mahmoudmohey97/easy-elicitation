const util = require('util');
const con = require('../database');
const bcrypt = require('bcryptjs')
var sendemail = require('../sendmail')
const crypto = require('crypto')
const query = util.promisify(con.query).bind(con);


module.exports.getBusinessAnalystsByCompanyName = async function (companyName) {
	// mesh fel project
	let sql = "SELECT * FROM businessanalyst WHERE companyName = ?";
	let inserts = [companyName];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

module.exports.getBusinessAnalystCompanyName = async function (req) {
	let sql = "SELECT companyName FROM businessanalyst WHERE businessAnalystId = ? ";
	let inserts = [req.session.baid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};
module.exports.getBaById = async function (baid) {
	let sql = "SELECT * FROM businessanalyst WHERE businessAnalystId = ? ";
	let inserts = [baid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	if (output.length === 1)
		return output[0];
	return null;
};
module.exports.getBAByEmail = async function(email){
	let sql = "SELECT * FROM businessanalyst WHERE email = ? ";
	let inserts = [email];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}
module.exports.getBAByEmailAndToken = async function(email,token){
	let sql = "select * from businessanalyst where email = ? and resetPasswordToken = ? ";
	let inserts = [email,token];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	if (output.length === 1)
		return output[0];
	return null;
}
module.exports.updateBAPassword = async function(hashedpassword,email){
	let sql = "update businessanalyst set password = ? , resetPasswordToken = null , expireToken = null where email = ? ";
	let inserts = [hashedpassword,email];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}
module.exports.updateBATokenAndExpireToken = async function(token,expireToken,email){
	let sql = "update businessanalyst set resetPasswordToken = ? , expireToken = ? where email = ? ";
	let inserts = [token,expireToken,email];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}
module.exports.editprofile = async function (hashedpassword, email,name) {
	let sql = "update businessanalyst set password = ? , name = ? where email = ? "
	let inserts = [hashedpassword,name, email]
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}
