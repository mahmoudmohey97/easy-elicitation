var projectModel = require("../models/project");
var businessAnalystModel = require("../models/businessAnalyst");
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
var sendemail = require('../sendmail')

module.exports.home = async function (req, res) {
	if (!req.session.baid) {
		res.redirect("/BAloginpage");
	}
	else {
		var result1 = await projectModel.getProjectsCreatedByBA(req);
		var result2 = await projectModel.getBusinessAnalystParticipatingProjects(req);
		for (var i = 0; i < result1.length; ++i) {
			var counts = await projectModel.countParticipants(result1[i].projectId);
			result1[i].counts = counts;
		}
		for (var i = 0; i < result2.length; ++i) {
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

exports.businessLogin = async function (req, res) {
	var result = await businessAnalystModel.getBAByEmail(req.body.email);
	if (result.length == 0) {
		res.send("Invalid email or password")
	}
	else {
		bcrypt.compare(req.body.password, result[0].password)
			.then(match => {
				if (!match) {
					res.send("Invalid email or password")
				}
				else { //Add admin name and email to the session
					req.session.user = result[0].name;
					req.session.email = result[0].email;
					req.session.baid = result[0].businessAnalystId;
					req.session.companyName = result[0].companyName;
					req.session.save()
					res.send("successfully loggedin")
				}
			})
	}
};
exports.sendResetPasswordEmail = async function (req, res) {
	var result = await businessAnalystModel.getBAByEmail(req.query.email);
	if (result.length == 0) {
		res.send("user not found")
	}
	else {
		crypto.randomBytes(32, async (err, buffer) => {
			if (err) console.log(err)
			else {
				const token = buffer.toString("hex")
				console.log(token)
				var email = req.query.email
				var expireToken = Date.now() + 3600000
				var updateresult = await businessAnalystModel.updateBATokenAndExpireToken(token, expireToken, email)
				var emailsubject = "please reset your password"
				var emailtext = "Please use the following link to reset your password \n"
					+ req.protocol + '://' + req.get('host') + "/resetpassword/" + token + "?email=" + email + "&type=BA"
				sendemail.sendToNewAdmin(email, emailsubject, emailtext)
				res.send("please check your email to reset password")
			}

		})

	}
}
exports.resetPassword = async function (req, res) {
	var newpassword = req.body.password
	var email = req.body.email
	var token = req.body.token
	var result = await businessAnalystModel.getBAByEmailAndToken(email.token)
	var expireToken = result.expireToken;
	if (parseInt(expireToken) >= parseInt(Date.now().toString())) {
		var hashedpassword = await bcrypt.hash(newpassword, 12)
		var updateresult = await businessAnalystModel.updateBAPassword(hashedpassword, email)
		res.redirect('/')
	}
	res.send("token expired")
}
module.exports.editprofile = async function (req, res) {
    var hashedpassword;
    var result = await businessAnalystModel.getBAByEmail(req.session.email)
    if (result.length == 0) {
        res.send("user not found")
    }
    if (req.body.oldpassword == "" && req.body.newpassword == "") {
        hashedpassword = result[0].password
    }
    else {
        var match = await bcrypt.compare(req.body.oldpassword, result[0].password)
        if (!match) {
            res.send("wrong old password")
            return;
        }
        hashedpassword = await bcrypt.hash(req.body.newpassword, 12)
    }
    var result = await businessAnalystModel.editprofile(hashedpassword, req.session.email, req.body.name)
    req.session.user = req.body.name
    res.send("ok")
}
