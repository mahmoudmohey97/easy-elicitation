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
        for (var i = 0; i < results.length; ++i) {
            var counts = await projectModel.countParticipants(results[i].projectId);
            results[i].counts = counts;
        }
        res.render('client/home', { data: results });
    }
};
module.exports.clientLogin = async function (req, res) {
    var result = await clientModel.getClientByEmail(req.body.email);
    if (result === null) {
        res.send("Invalid email or password")
    }
    else {
        bcrypt.compare(req.body.password, result.password)
            .then(match => {
                if (!match) {
                    res.send("Invalid email or password")
                }
                else { //Add admin name and email to the session
                    req.session.user = result.name;
                    req.session.email = result.email;
                    req.session.cid = result.clientId;
                    res.send("successfully loggedin")
                    if(req.session.redirectTo)
                    {
                        var temp = req.session.redirectTo;
                        req.session.redirectTo = null;
                        res.redirect(temp)
                    }
                }
            })
    }

};
module.exports.sendResetPasswordEmail = async function (req, res) {
    var result = await clientModel.getClientByEmail(req.query.email)
    if (result === null) {
        res.send("user not found")
    }
    else {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) console.log(err)
            else {
                const token = buffer.toString("hex")
                var email = req.query.email
                var expireToken = Date.now() + 3600000
                var output = await clientModel.updateTokenAndExpireTokenOfClient(token, expireToken, email)
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
    var result = await clientModel.getClientByEmailAndToken(req.body.email, req.body.token)
    if (result === null) {
        res.send("no such user")
    }
    else {
        var expireToken = result.expireToken;
        if (parseInt(expireToken) >= parseInt(Date.now().toString())) {
            var hashedpassword = await bcrypt.hash(req.body.password, 12)
            var output = await clientModel.updatePasswordOfClient(req.body.email, hashedpassword)
            console.log(output)
            res.redirect('/')
        }
    }
}
module.exports.insertNewClient = async function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    //generates password for the new admin
    var password = generator.generate({
        length: 10,
        numbers: true
    });
    var hashedpassword = await bcrypt.hash(password, 12)
    var result = await clientModel.insertNewClient(name, email, hashedpassword)
    var emailtext = "A new Account was created for you as a Client \n your usename is:"
        + name + "\n your password is: " + password + "\n You can change the password anytime from your account \n"
    sendemail.sendToNewAdmin(email, "Easy Elicitation Client Account", emailtext)
};
module.exports.editpassword = async function (req, res) {
    var result = await clientModel.getClientByEmail(req.session.email)
    if (result.length == 0) {
        res.send("user not found")
    }
    var match = await bcrypt.compare(req.body.oldpassword, result[0].password)
    if (!match) {
        res.send("wrong old password")
    }
    else {
        var hashedpassword = await bcrypt.hash(req.body.newpassword, 12)
        var result = await clientModel.editPassowrd(hashedpassword, req.session.email)
        res.send("ok")
    }
}


