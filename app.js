var config = require('./config.json');

var mongoose = require('mongoose');
var schema = mongoose.Schema;
mongoose.connect(config.mongoConnection);

var models = require('./models/game-models.js').makeModels(schema, mongoose);
var Message = models['message'];
var Trivia = models['trivia'];
var TriviaSession = models['trivia_session'];
var Session = models['session'];
var User = models['user'];

var clientInfo = { };

var app = require('http').createServer(handler)
	,io = require('socket.io').listen(app)
	,fs = require('fs')

app.listen(config.port);	

/*
Trivia.find({ _id : mongoose.Types.ObjectId('512ec2aea37dd4f002000006'),triviaName : 'T1' }).exec(function(err,trivias) {
	if(!err) {
		for(var i = 0; i < trivias.length; i++) {
			console.log(trivias[i].questions);
		}
	}	
	else
		console.log('err');
});
*/
	
if(config.allowedSockets.length != 0){
	io.set('origins', config.allowedSockets.join(', '));
}  
function handler (req, res) {
	var lastChar = req.url.substring(req.url.length - 1, req.url.length);
	var fileToRead = req.url.substring(1, 7) == 'assets' || req.url == '/favicon.ico' ? req.url : '/index.html';
	var extMap = { 'gif' : 'image/gif', 'jpg' : 'image/jpeg', 'jpeg' : 'image/jpeg', 'png' : 'image/png', 'html' : 'text/html', 'ico' : 'image/x-icon', 'js' : 'application/javascript', 'css' : 'text/css', 'json' : 'application/json' };
	var data = fileToRead.split('.');
	var ext = data[data.length - 1].toLowerCase(); 
	var contentType = extMap[ext] == undefined ? extMap['html'] : extMap[ext];
  
	fs.readFile(__dirname + fileToRead, function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading ' + fileToRead);
		}
		res.setHeader('X-UA-Compatible', 'IE=edge');
		res.writeHead(200, {'Content-Type': contentType });
		res.end(data);
  });
}

io.sockets.on('connection',function(socket) {
	
	clientInfo[socket.id] =  { };
	
	socket.emit('request', {});
	
	socket.on('registerClient', function(data) {
		var sessionId =  data.id;
		clientInfo[socket.id].sessionId = data.id;
	});
	
	
	
	
	
	socket.on('createTrivia', function(data){
		var name = data.triviaName;
		var triviaName = Trivia({triviaName : name });
	});
	
	socket.on('register', function(data){
		var name = data.cookie;
	});
	
});
