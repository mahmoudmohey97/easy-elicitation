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
module.exports.insertNewClient = async function(name,email,hashedpassword){
	let sql = "INSERT INTO client (name,email,password) VALUES (?,?,?) ";
        let inserts = [name, email, hashedpassword]
        sql = db.format(sql, inserts);
        const output = await query(sql);
        return output;
}
module.exports.editPassword = async function (hashedpassword, email) {
	let sql = "update client set password = ? where email = ? "
	let inserts = [hashedpassword, email]
	sql = db.format(sql, inserts);
	const output = await query(sql);
	return output;
}