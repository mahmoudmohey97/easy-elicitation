var projectModel = require("../models/project");
var clientModel = require("../models/client");
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
var sendemail = require('../sendmail') 

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
module.exports.clientLogin = async function (req, res) {
    var result = await clientModel.getClientByEmail(req.body.email);
    if(result=== null){
        res.send("Invalid email or password")
    }
    else{
        bcrypt.compare(req.body.password, result.password)
				.then(match => {
					if (!match) {
						res.send("Invalid email or password")
					}
					else { //Add admin name and email to the session
						req.session.user = result.name;
						req.session.email = result.email;
						req.session.cid = result.clientId;
						req.session.save()
						res.send("successfully loggedin")
					}
				})
    }

};
module.exports.sendResetPasswordEmail = async function (req, res) {
    // clientModel.forgetPassword(req, res)
    var result = await clientModel.getClientByEmail(req.query.email)
    if(result === null){
        res.send("user not found")
    }
    else{
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) console.log(err)
            else {
                const token = buffer.toString("hex")
                var email = req.query.email
                var expireToken = Date.now() + 3600000
                var output = await clientModel.updateTokenAndExpireTokenOfClient(token,expireToken,email)
                var emailsubject = "please reset your password"
                var emailtext = "Please use the following link to reset your password \n"
                + req.protocol + '://' + req.get('host') + "/resetpassword/" + token + "?email=" + email + "&type=client"
                sendemail.sendToNewAdmin(email, emailsubject, emailtext)
                res.redirect('/')
                }
            })
        }
}
module.exports.resetPassword = async function (req, res) {
    // clientModel.resetPassword(req, res)
    var result = await clientModel.getClientByEmailAndToken(req.body.email,req.body.token)
    if (result === null) {
        res.send("no such user")
    }
    else {
        var expireToken = result.expireToken;
        if (parseInt(expireToken) >= parseInt(Date.now().toString())) {
            var hashedpassword = await bcrypt.hash(req.body.password, 12)
            var output = await clientModel.updatePasswordOfClient(req.body.email,hashedpassword)
            console.log(output)
            res.send("password reset")
            //elmafrood troo7 l 7eta
        }
    }
}

