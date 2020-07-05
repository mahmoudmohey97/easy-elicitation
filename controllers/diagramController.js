const model = require('../models/diagram');
const projectModel = require('../models/project');

module.exports.deleteDiagram = async function (req, res) {
    await model.deleteDiagram(req.query.did);
    res.redirect(req.get('referer'));
}

module.exports.addDiagramRelation = async function (req, res) {
    diagram1Id = req.get('diagram1Id');
    diagram2Id = req.get('diagram2Id');
    realtionName = req.get('relationName');
    projectId = req.get('pid');
    await model.addDiagramRelation(diagram1Id, diagram2Id, realtionName, projectId);
}

module.exports.deleteRelation = async function (req, res) {
    await model.deleteDiagramRelation(req.get('relationId'));
    res.send("deleted")
}

module.exports.projectRelations = async function (pid) {
    var results = await model.getProjectRelations(pid);
    // res.send(results)
    return results;
}

module.exports.deleteDiagramRelation = async function (req, res) {
    await model.deleteDiagramRelation(req.query.id);
    res.send("deleted")
}

module.exports.createDiagram = async function (req, res) {

    var name = req.get('name');
    var description = req.get('description');
    var projectId = req.get('pid');
    description = description.replace(/\(newLine\)/g, "\n");
    try {
        await model.addDiagram(name, description, projectId);
        res.send(200);
    }
    catch (error) {
        res.send(400);
    }
}

module.exports.approveDiagram = async function (req, res) {
    if (req.session.cid) {
        await model.cApprove(req.query.did, req.session.cid);
        await model.checkApproval(req.query.did);
        await projectModel.checkApproval(req.query.did);
    }
    else if (req.session.baid) {
        await model.baApprove(req.query.did, req.session.baid);
        await model.checkApproval(req.query.did);
        await projectModel.checkApproval(req.query.did);
    }
    else {
        res.send(400);
        return;
    }
    res.redirect(req.get('referer'));
}

module.exports.revokeApproveDiagram = async function (req, res) {
    if (req.session.cid) {
        await model.cRevokeApprove(req.query.did, req.session.cid);
        await model.checkApproval(req.query.did);
        await projectModel.checkApproval(req.query.did);
    }
    else if (req.session.baid) {
        await model.baRevokeApprove(req.query.did, req.session.baid);
        await model.checkApproval(req.query.did);
        await projectModel.checkApproval(req.query.did);
    }
    else {
        res.send(400);
        return;
    }
    res.redirect(req.get('referer'));
}