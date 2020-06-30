var express = require('express');
var router = express.Router();


var projectController = require('./controllers/projectController');
var diagramController = require('./controllers/diagramController');
var businessAnalystController = require('./controllers/businessAnalystController');
var clientController = require('./controllers/clientController');
var drawingToolController = require('./controllers/drawingToolController');

router.get('/getDiagram/:room', drawingToolController.home);
router.get('/loadDiagram', drawingToolController.actual); // Needs ?room=xxx
router.post('/uploadMedia', drawingToolController.upload);
router.get('/viewMedia/:type/:name', drawingToolController.viewMedia);

router.get('/project', projectController.projectHome);
router.post('/createProject', projectController.createProject);
//router.get('/up', projectController.send);
router.post('/upload', projectController.uploadFile);
router.post('/createDiagram', diagramController.createDiagram);
router.get('/ba', businessAnalystController.home);
router.post('/ba', businessAnalystController.home);
router.get('/client', clientController.home);

// sending Email
router.get('/sendEmail', projectController.inviteClient);
router.post('/sendEmailToBA', projectController.inviteBA);

// Invitation
router.get('/clientInvitation', projectController.handleClientInvitationLink);
router.get('/baInvitation', projectController.handleBAInvitationLink);
router.get('/getBasInCompany', businessAnalystController.getBAsInMyCompany);
router.get('/getBasNotInProject', projectController.getBAsNotInProject);
router.get('/leaveProject', projectController.leaveProject);
router.post('/removeBa', projectController.removeBa);
router.post('/removeClient', projectController.removeClient);
router.get('/leaveProject', projectController.leaveProject);
router.get('/deleteProject', projectController.deleteProject);
router.get('/deleteDiagram', diagramController.deleteDiagram);
router.get('/approveDiagram', diagramController.approveDiagram);
router.get('/revokeApproveDiagram', diagramController.revokeApproveDiagram);
router.post("/createDiagramRelation", diagramController.addDiagramRelation);
// router.get("/getProjectRelations", diagramController.projectRelations); // for diagram relations
router.get("/deleteRelation", diagramController.deleteDiagramRelation);
// router.get("/", businessAnalystController.home);
router.post('/deleteRelation', diagramController.deleteRelation)


/**/
router.get('/', function (req, res) {
    if (req.session.cid)
        res.redirect("/client");
    else if (req.session.baid)
        res.redirect("/ba");
    else
        res.sendFile('views/Home.html', { root: __dirname });
})
router.get('/clientloginpage', function (req, res) {
    if (req.session.cid)
        res.redirect("/client");
    else
        res.sendFile('views/LoginasClient.html', { root: __dirname });
})
router.get('/BAloginpage', function (req, res) {
    if (req.session.baid)
        res.redirect("/ba");
    else
        res.sendFile('views/LoginasBA.html', { root: __dirname });
})

router.post('/clientlogin', clientController.clientLogin);
router.post('/businesslogin', businessAnalystController.businessLogin);



router.get('/forgotpassword', function (req, res) {
    res.render('forgotpasswordpage', { type: req.query.type })
})
router.get('/resetpassword/:token', function (req, res) {
    var token = req.params.token
    var email = req.query.email
    var type = req.query.type
    res.render('newpassword', {
        token: token,
        email: email,
        type: type
    })

})
router.get('/sendresetpasswordemail', function (req, res) {
    if (req.query.type === "BA")
        businessAnalystController.sendResetPasswordEmail(req, res);
    else {
        clientController.sendResetPasswordEmail(req, res);
    }
})
router.post('/resetpassword', function (req, res) {
    if (req.body.type === "BA") {
        businessAnalystController.resetPassword(req, res)
    }
    else {
        clientController.resetPassword(req, res)
    }
})


module.exports = router;

