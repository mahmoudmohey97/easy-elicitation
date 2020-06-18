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
router.get("/",  businessAnalystController.home);
router.post('/deleteRelation', diagramController.deleteRelation)
module.exports = router;
