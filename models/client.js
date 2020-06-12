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