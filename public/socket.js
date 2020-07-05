// socket = io.connect('https://easy-elicitation.herokuapp.com?room=' + urlParams['room']');
socket = io.connect(window.location.origin + '?room=' + urlParams['room']);
var changing = false;

socket.on('savedRoomData', function(data) {
	if (data['xml'] != null) {
		changing = true;
		drawFullXml(data);
		globalEditor.editor.undoManager.clear();
	}
	for(var i = 0; i < data['onlineUsers'].length; i++)
		addActiveUser(data['onlineUsers'][i]);
});

socket.on('newUser', function(data) {
	addActiveUser(data['username']);
});

socket.on('userLeft', function(data) {
	removeActiveUser(data['username']);
});

function collaborate(){
	globalEditor.editor.graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt)
	{	
		if (changing) {
			changing = false;
			return false;
		}
		emitChangesOnly(evt);
	});
}

socket.on('changes', function(data) {
	if (data['username'] && data['xml'] == undefined)
	{
		changeLatestEdit(data['username']);
		return;
	}
	changing = true;
	drawChangesOnly(data);
	changeLatestEdit(data['username']);
});

function emitChangesOnly(evt)
{
	var xml = mxUtils.getXml(globalEditor.editor.getGraphXml());
	var changes = evt.getProperty('edit').changes;
	var nodes = [];
	var codec = new mxCodec();
	for (var i = 0; i < changes.length; i++)
	{
		nodes.push(xml2String(codec.encode(changes[i])));		
	}
	socket.emit('changes', {
		room: urlParams['room'],
		nodes: nodes,
		xml: xml,
	});
}

function drawChangesOnly(data)
{
	var changes = [];             
	for (var i = 0; i < data['nodes'].length; i++)
	{
		node = string2Xml(data['nodes'][i]);
		var codec = new mxCodec();
		codec.lookup = function(id)
		{
			return globalEditor.editor.graph.model.getCell(id);
		}
		var change = codec.decode(node);
		change.model = globalEditor.editor.graph.model;
		change.execute();
		changes.push(change);
	}
	var edit = new mxUndoableEdit(globalEditor.editor.graph.model, false);
	edit.changes = changes;
	edit.significant = true;
	edit.notify = function()
	{
		edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE,
			'edit', edit, 'changes', edit.changes));
		edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY,
			'edit', edit, 'changes', edit.changes));
	}
	globalEditor.editor.graph.model.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
	globalEditor.editor.graph.model.fireEvent(new mxEventObject(mxEvent.CHANGE,
		'edit', edit, 'changes', changes));
}

function xml2String(xml)
{
	return new XMLSerializer().serializeToString(xml);
}

function string2Xml(str)
{
	parser = new DOMParser();
	xmlDoc = parser.parseFromString(str, "text/xml");
	return xmlDoc.getElementsByTagName(xmlDoc.documentElement.nodeName)[0];
}

function emitFullXml()
{
	xml = mxUtils.getXml(globalEditor.editor.getGraphXml());
	socket.emit('changes', {
		room: urlParams['room'],
		xml: xml
	});
}

function drawFullXml(data) 
{
	let doc = mxUtils.parseXml(data['xml']);
	globalEditor.editor.setGraphXml(doc.documentElement);
}