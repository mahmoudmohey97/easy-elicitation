const util = require('util');
const con = require('../database');
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
	if(output.length === 1)
		return output[0];
	return null;
};