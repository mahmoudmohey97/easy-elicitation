var projectModel = require("../models/project");

module.exports.home = async function (req, res) {
    req.session.cid = 3;
    req.session.user = 'Meho';
    if (!req.session.cid) {
        res.render('errors/404');
    }
    else {
        var results = await projectModel.getClientProjects(req);
        for(var i = 0; i < results.length; ++i)
		{
			var counts = await projectModel.countParticipants(results[i].projectId);
			results[i].counts = counts;
		}
        res.render('client/home', { data: results });
    }
};

