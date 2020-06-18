const con = require('../database');
const util = require('util');
const query = util.promisify(con.query).bind(con);

module.exports.deleteDiagram = async function (did) {
	sql = "delete from diagram where diagramId = ?";
	inserts = [did];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.addDiagramRelation = async function (diagram1Id, diagram2Id, realtionName, projectId) {
	sql = "insert into diagramrelation (diagram1Id, diagram2Id, type, projectId) values(?, ?, ?, ?)";
	inserts = [diagram1Id, diagram2Id, realtionName, projectId];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}
module.exports.deleteDiagramRelation = async function (id) {
	sql = "delete from diagramrelation where relationId = ?";
	inserts = [id];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.getProjectRelations = async function (projectId) {
	sql = "SELECT dir.relationId, A.NAME AS diagram1Name, B.NAME AS diagram2Name, dir.type AS type\
	FROM diagram A, diagram B, diagramrelation as dir\
	WHERE A.diagramId = dir.Diagram1Id \
	AND B.diagramId = dir.Diagram2Id\
	AND A.projectId = ?\
	AND B.projectId = ?\
	AND dir.projectId = ?";
	inserts = [projectId, projectId, projectId];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.deleteDiagramRelation = async function (id) {
	sql = "DELETE FROM diagramrelation WHERE relationId = ?"
	inserts = [id];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.addDiagram = async function (name, description, projectId) {
	let sql = "insert into diagram(approval, serializedDiagram, name, description, projectId) values(0, '', ?, ?, ?)"
	let inserts = [name, description, projectId];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

module.exports.showProjectDiagrams = async function (req) {
	let sql = "select * from diagram where projectId=?"
	let inserts = [req.query.pid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

module.exports.saveDiagram = async function (did, xml) {
	let sql = "update diagram set serializedDiagram=? where diagramId=?"
	let inserts = [xml, did]
	sql = con.format(sql, inserts)	
	try {
		const output = await query(sql);
		return 1;
	}
	catch (error) {
		return -1;
	}
};

module.exports.getDiagram = async function (did) {
	let sql = "select * from diagram where diagramId=?"
	let inserts = [did];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output[0];
};

module.exports.baApprove = async function (did, baid) {
	let sql = "insert into approvals(did, baid) values(?, ?)"
	let inserts = [did, baid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

module.exports.cApprove = async function (did, cid) {
	let sql = "insert into approvals(did, cid) values(?, ?)"
	let inserts = [did, cid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

module.exports.getBaApprovals = async function(baid) {
	let sql = "select did from approvals where baid=?";
	let inserts = [baid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.getCApprovals = async function(cid) {
	let sql = "select did from approvals where cid=?";
	let inserts = [cid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.baRevokeApprove = async function (did, baid) {
	let sql = "delete from approvals where did=? and baid=?"
	let inserts = [did, baid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

module.exports.cRevokeApprove = async function (did, cid) {
	let sql = "delete from approvals where did=? and cid=?"
	let inserts = [did, cid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};