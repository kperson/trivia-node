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
var sessionIdList =  [];
var clientInfoReverse = { };

var app = require('http').createServer(handler)
	,io = require('socket.io').listen(app)
	,fs = require('fs')

app.listen(config.port);	

	
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
	
	
	socket.sendMessage = function(key, value, sessionId) {
		if(sessionId == undefined){
			if (clientInfo[socket.id] == undefined){
				sessionId = clientInfo[socket.id];
			}
			else{
				sessionId = null;
			}
		}
		var status = sessionId == null ? 'sent' : 'unsent';
		var msg = Message({ sessionId : sessionId, status : status });
		msg.put('messageKey', key);
		msg.put('data', value);
		msg.sendIn(0, function(err, doc){
			if(sessionId == null){
				console.log('Sending: ' +  JSON.stringify(doc.normalize()));
				socket.emit('message', doc.normalize());
			}
			else{
				console.log('Queueing: ' +  JSON.stringify(doc.normalize()));				
			}
		});	
	};
	
	socket.findSessionId = function(){
		return clientInfoReverse[socket.id];
	}
	
   	
	socket.on('registerClient', function(data){
		console.log('Registration Info: ' + JSON.stringify(data));
		sessionIdList.push(data.sessionId);
		clientInfo[data.sessionId] = { socketId : socket.id };	
		clientInfoReverse[socket.id] = data.sessionId;	
		socket.sendMessage('registerComplete', { });
	});	
	
	socket.on('reRegister', function(data) {
		socket.sendMessage('requestRegister', { });
	});	
	
	socket.on('createTrivia', function(data){
		console.log('Trivia Info: ' + JSON.stringify(data));
		var name = data.triviaName;
		var trivia = new Trivia({triviaName : name, sessionId : socket.findSessionId() });
		trivia.save(function(err, doc) {
			console.log('Trivia Save Complete: ' + doc);
			if(err){
				console.log('Error: ' + err);
			}
			else{
				console.log('SessionId: ' + doc.sessionId);
				socket.sendMessage('triviaCreated', { triviaId : doc.id });
			}
		});
	});
	
	socket.on('getMyTriviaByTriviaId', function(data) {
		console.log(data);
		Trivia.findOne({ _id :  mongoose.Types.ObjectId(data.triviaId), sessionId : clientInfoReverse[socket.id] }).exec(function(err, trivia){
			socket.sendMessage('myTrivia', trivia);
		});
	});
	
	
	socket.on('disconnect', function () {
		console.log('Disconnecting');
		var foundSessionId = socket.findSessionId();
		if(foundSessionId != undefined){
			delete clientInfo[foundSessionId];
			delete clientInfoReverse[socket.id];
			for(var i = 0; i < sessionIdList.length; i++){
				if(sessionIdList[i] == foundSessionId){
					sessionIdList.splice(i, 1);
					break;
				}
			}			
		}
	});
});



setInterval(function() {
	Message.dequeue(sessionIdList, function(err, msgs){
		if(!err){
			msgs.forEach(function(msg){
				console.log('Sending queued: ' +  JSON.stringify(msg.normalize()));		
				if(clientInfo[msg.sessionId] != undefined){
					msg.markAsSent(function(err, doc){
						try {
							io.sockets.sockets[clientInfo[msg.sessionId].socketId].emit('message', msg.normalize());
						}
						catch(err){
							console.log(err);
						}
					});
				}
			});
		}
	});
}, config.messageCheckInterval);
