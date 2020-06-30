var projectModel = require("../models/project");
var clientModel = require("../models/client");

module.exports.home = async function (req, res) {
    if (!req.session.cid) {
        res.redirect("/clientloginpage");
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

exports.clientLogin = function (req, res) {
    clientModel.login(req, res);
};
exports.sendResetPasswordEmail = function (req, res) {
    clientModel.forgetPassword(req, res)
}
exports.resetPassword = function (req, res) {
    clientModel.resetPassword(req, res)
}
exports.editPassword = function (req, res) {
    clientModel.editPassword(req, res)
}

