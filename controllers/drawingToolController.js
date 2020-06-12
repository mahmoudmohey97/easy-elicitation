const fs = require('fs');
const diagram = require('../models/diagram');

module.exports.home = async function(req, res) {
    let name = await diagram.getDiagram(req.params.room);
    name = name.name;
    res.render('drawing/home', {room: req.params.room, name: name});
}

module.exports.actual = function(req, res) {
    res.render('drawing/diagram');
}

module.exports.upload = function(req, res){
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let file = req.files.file;
    let type = req.body.fileType;
    let name = req.body.name.replace(' ', '_') + '_' + Math.round(Date.now() / 1000);
    let path = 'uploads/' + type + '/' + name;
    file.mv(path, function(err) {
        if (err)
            return res.status(500).send(err);
        res.send('http://' + req.headers.host + '/viewMedia/' + type + '/' + name);
    });
};

module.exports.viewMedia = function(req, res) {
    let path = '';
    if (req.params.type == 'image')
        path = 'uploads/image/' + req.params.name;
    else if (req.params.type == 'vn')
        path = 'uploads/vn/' + req.params.name;
    else res.status(404).send(req.params.type);

    fs.exists(path, function(exists) {
        if (exists) {     
            let data = fs.readFileSync(path);
            res.write(data);
            res.end();
        }
    });
};