var projectModel = require("../models/project");
var businessAnalystModel = require("../models/businessAnalyst");

module.exports.home = async function (req, res) {
	req.session.baid = 4;
	req.session.user = 'Ali';
	if (!req.session.baid) {
		res.render('errors/404');
	}
	else {
		var result1 = await projectModel.getProjectsCreatedByBA(req);
		var result2 = await projectModel.getBusinessAnalystParticipatingProjects(req);
		for(var i = 0; i < result1.length; ++i)
		{
			var counts = await projectModel.countParticipants(result1[i].projectId);
			result1[i].counts = counts;
		}
		for(var i = 0; i < result2.length; ++i)
		{
			var counts = await projectModel.countParticipants(result2[i].projectId);
			result2[i].counts = counts;
		}
		res.render('business-analyst/home', { myProjects: result1, projects: result2 });
	}
}

module.exports.getBAsInMyCompany = async function (req, res) {
	if (!req.session.baid) {
		res.render('errors/404');
	}
	else {
		console.log('called');
		
		var result = await businessAnalystModel.getBaById(req.session.baid);
		var bas = await businessAnalystModel.getBusinessAnalystsByCompanyName(result.companyName);
		var emails = "";
		for (var i = 0; i < bas.length; ++i) {
			if (bas[i].businessAnalystId !== req.session.baid) {
				emails += bas[i].email;
				if (i < bas.length - 1)
					emails += ",";
			}
		}
		res.send(emails);
	}

}
