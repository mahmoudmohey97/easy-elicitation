const bodyParser = require('body-parser');
var router = require('./routes');
const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session')({
    cookie: {
        path    : '/',
        httpOnly: true,
        maxAge  : 24*60*60*1000
      },
    cookieName: 'session',
    secret: "$0_$3cR37_K3Y",
    resave: true,
    saveUninitialized: true
  });
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const sharedsession = require("express-socket.io-session");

// Attach session
app.use(session);
// Share session with io sockets
io.use(sharedsession(session), {
    autoSave:true
});

var sockets = require('./controllers/socketsController');
sockets.colaborate(io);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());

// View Engine..  Extension
app.set('view engine', 'ejs');
app.use('/css',express.static(__dirname +'/css'));

app.use ((req, res, next) => {
  res.locals.url = req.protocol + '://' + req.get('host');
  next();
});

// Routes Handler
app.use('/', router); 

//static files
app.use(express.static('./public'));



// handle 404
app.use(function (req, res, next) {
    res.status(404);
    res.render('errors/404', { url: req.url });
});

// app.listen(3000);
server.listen(80);
console.log(`Running on ${80}`);
