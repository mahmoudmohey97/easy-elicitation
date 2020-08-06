const model = require('../models/project');
const sendMailModel = require('../sendmail');
const diagramModel = require('../models/diagram');
const encryptModel = require('../models/encrypt_decrypt')
const clientModel = require('../models/client')
const businessAnalystModel = require('../models/businessAnalyst')
const formidable = require('formidable');
const mv = require('mv');
const path = require('path');


module.exports.projectHome = async function (req, res) {

    if ((req.session.baid || req.session.cid) && req.query.pid) {

        var project = await model.getProjectById(req.query.pid);
        var baParticipants = await model.getProjectBa(req.query.pid);
        // console.log(baParticipants);
        var approved = (req.session.baid) ? await diagramModel.getBaApprovals(req.session.baid) : await diagramModel.getCApprovals(req.session.cid);
        approved = JSON.parse(JSON.stringify(approved));
        var clientsParticipants = await model.getProjectClients(req.query.pid);
        var projectDiagrams = await diagramModel.showProjectDiagrams(req);
        var diagramsRelations = await diagramModel.getProjectRelations(req.query.pid);
        req.query = { pid: req.query.pid }
        var owner = await model.getProjectOwner(req.query.pid);
        var attachements = await model.getAllAttachments(req.query.pid);
        var ba = (!req.session.baid) ? false : true;
        var userId = (!req.session.baid) ? req.session.cid : req.session.baid;
        res.render('project/projectHome', {
            projectName: project.name,
            auth: ba, diagrams: projectDiagrams, businessAnalysts: baParticipants,
            diagramsRelations: diagramsRelations,
            clients: clientsParticipants, userId: userId,
            owner: { email: owner.email, name: owner.name, id: owner.businessAnalystId },
            attachements: attachements, projectId: req.query.pid, approved: approved
        });
    }
    else {
        res.redirect("/")
    }
};

module.exports.inviteClient = async function (req, res) {
    if (req.query.name) {
        var result = await model.getProjectByBaAndName(req.session.baid, req.query.name);
        var encryptedMail = encryptModel.encrypt(req.query.mail);
        mail = encryptedMail;
        var link = req.protocol + '://' + req.get('host') + "/clientInvitation?pid=" + result[0].projectId + "&dt=" + parseInt(Date.now() / 1000) + "&to=" + mail;
        sendMailModel.invite(req.query.mail, req.query.name, link);
        res.send(200)
    }
    else if (req.query.pid) {
        var project = await model.getProjectById(req.query.pid);
        var encryptedMail = encryptModel.encrypt(req.query.mail);
        mail = encryptedMail;
        var link = req.protocol + '://' + req.get('host') + "/clientInvitation?pid=" + req.query.pid + "&dt=" + parseInt(Date.now() / 1000) + "&to=" + mail;
        sendMailModel.invite(req.query.mail, project.name, link);
        res.send(200)
    }
    else {
        // add fel session el url to redirect
        res.redirect("/client")
    }
}

module.exports.handleClientInvitationLink = async function (req, res) {

    if (req.session.cid) {
        var urlMail = req.query.to;
        var currentUserMail = '';
        var decryptedMail = encryptModel.decrypt(urlMail);
        urlMail = decryptedMail;
        var client = await clientModel.getClientById(req.session.cid);
        currentUserMail = client.email;
        if (urlMail === currentUserMail) {
            var time = req.query.dt;
            if (parseInt(Date.now() / 1000) <= parseInt(time) + 2 * 60) {
                var result = model.clientInvitation(req.session.cid, req.query.pid);
                res.redirect(`/project?pid=${req.query.pid}`)
            }
            else {
                res.render('errors/404'); // expired
            }
        }
        else {
            res.sendStatus(403);
        }

    }
    else {
        req.session.redirectTo = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.redirect("/client")
    }
}

module.exports.inviteBA = async function (req, res) {
    mail = req.body['data[]'];
    name = req.body['name'];
    projectId = req.body['projectId'];
    if (req.session.baid && !name) {
        var project = await model.getProjectById(projectId);
        var encryptedMail = encryptModel.encrypt(mail);
        encryptedMail = encryptedMail;
        var link = req.protocol + '://' + req.get('host') + "/baInvitation?pid=" + projectId + "&dt=" + parseInt(Date.now() / 1000) + "&to=" + encryptedMail;
        sendMailModel.invite(mail, project.name, link);
        res.send();
    }
    else if (req.session.baid && name) {
        var result = await model.getProjectByBaAndName(req.session.baid, name);
        var encryptedMail = encryptModel.encrypt(mail);
        encryptedMail = encryptedMail;
        var link = req.protocol + '://' + req.get('host') + "/baInvitation?pid=" + result[0].projectId + "&dt=" + parseInt(Date.now() / 1000) + "&to=" + encryptedMail;
        sendMailModel.invite(mail, name, link);
        res.send();
    }
    else
        res.redirect('/BAloginpage')
}

module.exports.handleBAInvitationLink = async function (req, res) {
    if (req.session.baid) {
        var urlMail = req.query.to;
        var currentUserMail = '';
        var decryptedMail = encryptModel.decrypt(urlMail);
        urlMail = decryptedMail;
        var output = await businessAnalystModel.getBaById(req.session.baid);
        currentUserMail = output.email;
        if (urlMail.includes(currentUserMail)) {
            var time = req.query.dt;
            if (parseInt(Date.now() / 1000) <= parseInt(time) + 2 * 60) {
                await model.businessAnalystInvitation(req.session.baid, req.query.pid);
                res.redirect(`/project?pid=${req.query.pid}`)
            }
            else {
                res.render('errors/404'); // expired
            }
        }
        else {
            res.sendStatus(403);
        }
    }
    else {
        req.session.redirectTo = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.redirect("/BAloginpage")
    }
}

module.exports.createProject = async function (req, res) {
    // console.log(req.body.name, req.session.baid);
    var out = await model.createProject(req.session.baid, req.body.name);
    if (out === -1)
        res.sendStatus(400);
    else
        res.sendStatus(200);
}

module.exports.uploadFile = async function (req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (error, fields, files) => {
        if (error) throw error;
        const file = files.file
        if (!(file.type.includes('pdf'))) {
            console.log('only pdf file can be uploaded');
            return false;
        }

        filePath = file.path;
        filename = Math.floor(new Date() / 1000) + '_' + file.name;
        newPath = path.join(`./public/attachements/${filename}`);
        mv(filePath, newPath, error => {
            if (error) throw error;
        }
        );
        link = `/attachements/${filename}`;
        projectId = fields.pid;
        await model.addPdfAttachment(file.name, link, projectId);
    });
}

module.exports.getBAsNotInProject = async function (req, res) {
    if (!req.session.baid) {
        res.redirect('/');
    }
    else {
        var result = await model.getProjectOwner(req.get('projectId'));
        var bas = await model.getBAsNotInProject(req.get('projectId'), result.businessAnalystId);
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

module.exports.leaveProject = async function (req, res) {
    if (req.session.baid) {
        await model.leaveProject(req, req.query.pid);
        res.redirect('/ba');
    }
    else if (req.session.cid) {
        await model.leaveProject(req, req.query.pid);
        res.redirect('/client');
    }
    else {
        //login
        
        req.session.redirectTo = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.redirect('/')
        // console("u must login");
    }
}

module.exports.removeBa = async function (req, res) {
    await model.removeBaFromProject(req.get('pid'), req.get('baid'));
    res.redirect('/project?pid=' + req.get('pid'))
}

module.exports.removeClient = async function (req, res) {
    await model.removeClientFromProject(req.get('pid'), req.get('cid'));
    res.redirect('/project?pid=' + req.get('pid'))
}

module.exports.deleteProject = async function (req, res) {
    await model.deleteProject(req.query.pid);
    res.redirect('/ba');
}
