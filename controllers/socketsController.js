const diagram = require('../models/diagram');
module.exports.colaborate = function(io) {
    // rooms = {};
    onlineUsers = {};
    clients = {};
    io.sockets.on('connection', async (socket) => {
        let username = socket.handshake.session.user;
        let room = socket.handshake.query.room;
        if(!room || !username)
            return; 
        clients[socket.id] = {username: username, room: room};
        console.log('Client connected: %j', clients[socket.id]);
    
        socket.join(room);
        if(onlineUsers[room] == undefined)
            onlineUsers[room] = [];
    
        // Send new user to others
        if(!onlineUsers[room].includes(username))
        {
            onlineUsers[room].push(username);
            socket.to(room).emit('newUser', {username: username});
        }
    
        // Send room data to new user
        diagramData = await diagram.getDiagram(room);
        diagramData = diagramData.serializedDiagram;
        if(diagramData == '')
            data = {xml: null, onlineUsers: onlineUsers[room]};
        else
            data = {xml: diagramData, onlineUsers: onlineUsers[room]};
        socket.emit('savedRoomData', data);
    
        // On new changes to graph
        socket.on('changes', async (data) => {
            data['username'] = username;
            socket.to(room).emit('changes', data);
            socket.emit('changes', {username: username});
            await diagram.saveDiagram(room, data['xml']);
            await diagram.revokeApprovals(room);
        });
    
        // On disconnection
        socket.on('disconnect', () => {
            if(clients[socket.id] && username && room){
                onlineUsers[room].splice(onlineUsers[room].indexOf(username), 1);
                socket.to(room).emit('userLeft', {username: username});
                delete clients[socket.id];
            }
            console.log('Client has disconnected.')
        });
    });
}