const util = require('util');
const con = require('../database');


const query = util.promisify(con.query).bind(con);


/*******************************
* 	get all projects business analyst participating in to display
*******************************/

module.exports.getBusinessAnalystParticipatingProjects = async function (req) {
	let sql = "SELECT * FROM businessanalystparticipant as ba, project WHERE ba.businessAnalystId = ? and project.projectId = ba.projectId";
	let inserts = [req.session.baid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

/*******************************
* 	get all projects that created by this business analyst
*******************************/
module.exports.getProjectsCreatedByBA = async function (req) {
	let sql = "SELECT * FROM project WHERE businessAnalystId = ?";
	let inserts = [req.session.baid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

/*******************************
* 	get all projects client participating in to display
*******************************/
module.exports.getClientProjects = async function (req) {
	let sql = "SELECT * FROM clientparticipant as cp, project WHERE clientId = ? and project.projectId = cp.projectId";
	let inserts = [req.session.cid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;

};

/*******************************
* 	get clients participating in project
*******************************/
module.exports.getProjectClients = async function (id) {
	let sql = "SELECT * FROM clientparticipant as cp, client where cp.projectId = ? and client.clientId = cp.clientId";
	let inserts = [id];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;

};

/*******************************
* 	get business analysts participating in project
*******************************/
module.exports.getProjectBa = async function (id) {
	let sql = "SELECT * FROM businessanalystparticipant as ba, businessanalyst where ba.projectId = ? and businessanalyst.businessAnalystId = ba.businessAnalystId ";
	let inserts = [id];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

/*******************************
* 	create project
*******************************/
module.exports.createProject = async function (baId, name) {
	let sql = "insert into project (name, approval, businessAnalystId) values (?, 0, ?)"
	let inserts = [name, baId]
	sql = con.format(sql, inserts)
	try {
		const output = await query(sql);
		return 1;
	}
	catch (error) {
		return -1;
	}

};

/*******************************
* 	get project BY BAId AND PROJECT NAME
*******************************/
module.exports.getProjectByBaAndName = async function (baId, name) {
	let sql = "SELECT * FROM project WHERE businessAnalystId = ? AND name = ? "
	let inserts = [baId, name]
	sql = con.format(sql, inserts)
	const output = await query(sql);
	return output;
};


module.exports.countParticipants = async function (projectId) {
	let sql = "select * from (select count(businessAnalystId) as businessAnalysts \
	from businessanalystparticipant \
	WHERE businessanalystparticipant.projectId = ?) as a,\
	(select count(clientId) as clients from clientparticipant WHERE clientparticipant.projectId = ? ) as b";
	let inserts = [projectId, projectId];
	sql = con.format(sql, inserts)
	const output = await query(sql);
	if(output.length === 1)
	{
		output[0].businessAnalysts += 1;
		return output[0];
	}
	return null;
};

module.exports.getProjectById = async function (projectId) {
	let sql = "SELECT * FROM project WHERE projectId = ?"
	let inserts = [projectId]
	sql = con.format(sql, inserts)
	const output = await query(sql);
	if(output.length === 1)
		return output[0];
	return null;
};


module.exports.clientInvitation = async function (clientId, projectId) {
	let sql = "INSERT INTO clientparticipant (clientId, projectId) values (?, ?)";
	let inserts = [clientId, projectId];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

module.exports.businessAnalystInvitation = async function (businessAnalystId, projectId) {
	let sql = "INSERT INTO businessanalystparticipant (businessanalystId, projectId) values (?, ?)";
	let inserts = [businessAnalystId, projectId];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
};

module.exports.getProjectOwner = async function (id) {
	let sql = "select * from project as p, businessanalyst as ba where p.projectId = ? AND p.businessanalystId = ba.businessanalystId"
	let inserts = [id];
	//console.log(inserts);
	sql = con.format(sql, inserts);
	const output = await query(sql);
	if(output.length === 1)
		return output[0];
	return null;
};

module.exports.addPdfAttachment = async function (name, link, projectId) {
	let sql = "insert into attachment (name, link, projectId) values(?, ?, ?)";
	inserts = [name, link, projectId];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	if(output.length === 1)
		return true;
	return false;
}

//PDF attachements
module.exports.getAllAttachments = async function (projectId) {
	sql = "select name , link from attachment where projectId = ? and diagramId IS NULL";
	inserts = [projectId];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
	
}

module.exports.getBAsNotInProject = async function (projectId, ownerId) {
	let sql = "SELECT * \
	FROM businessanalyst \
	WHERE businessanalyst.businessAnalystId not in(\
		SELECT businessanalystparticipant.businessAnalystId\
		FROM businessanalystparticipant\
		WHERE businessanalystparticipant.projectId = ?)\
	AND businessanalyst.businessAnalystId != ?\
	AND businessanalyst.companyName IN (SELECT companyName FROM businessanalyst as ba WHERE ba.businessAnalystId = ?)"

	let inserts = [projectId, ownerId, ownerId];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.leaveProject = async function (req, pid) {
	var sql = '';
	var inserts;
	if (req.session.baid) {
		sql = "delete from businessanalystparticipant where businessAnalystId = ? and projectId = ?";
		inserts = [req.session.baid, pid];
	}
	else if (req.session.cid) {
		sql = "delete from clientparticipant where clientId = ? and projectId = ?";
		inserts = [req.session.cid, pid];
	}
	else {
		console.log('wala 7aga mn dool ya ostaz');
	}
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.removeBaFromProject = async function (pid, baid) {
	sql = "delete from businessanalystparticipant where businessAnalystId = ? and projectId = ? ";
	inserts = [baid, pid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.removeClientFromProject = async function (pid, cid) {
	sql = "delete from clientparticipant where clientId = ? and projectId = ? ";
	inserts = [cid, pid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.deleteProject = async function (pid) {
	sql = "delete from project where projectId = ?";
	inserts = [pid];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}

module.exports.checkApproval = async function (did) {
	let sql = "select count(*) as dC from diagram where projectId in (select projectId from diagram where diagramId = ?)"
	let inserts = [did];
	sql = con.format(sql, inserts);
	const diagramsCount = await query(sql);
	sql = "select count(*) as dAC from diagram where projectId in (select projectId from diagram where diagramId = ?) and approval = 1";
	inserts = [did];
	sql = con.format(sql, inserts);
	const diagramsApprovalCount = await query(sql);
	const approval = (diagramsCount[0].dC == diagramsApprovalCount[0].dAC) ? 1 : 0;
	sql = "update project set approval = ? where projectId in (select projectId from diagram where diagramId = ?)";
	inserts = [approval, did];
	sql = con.format(sql, inserts);
	const output = await query(sql);
	return output;
}