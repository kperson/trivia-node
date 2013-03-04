var config = require('./config.json');

var mongoose = require('mongoose');
var schema = mongoose.Schema;
mongoose.connect(config.mongoConnection);

var models = require('./models/game-models.js').makeModels(schema, mongoose);
Message = models['message'];
var Trivia = models['trivia'];
var TriviaSession = models['trivia_session'];
var Session = models['session'];
var User = models['user'];

clientInfo = { };
sessionIdList =  [];
clientInfoReverse = { };

var app = require('http').createServer(require('./server-handler.js').handler)
io = require('socket.io').listen(app)


app.listen(config.port);	

	
if(config.allowedSockets.length != 0){
	io.set('origins', config.allowedSockets.join(', '));
}  


var socketWrapper = require('./socket-wrapper.js');

io.sockets.on('connection',function(socket) {
		
	require('./socket-setup.js').setupSocket(socket, socketWrapper);

	socket.on('createTrivia', function(data){
		var name = data.triviaName;
		var trivia = new Trivia({triviaName : name, sessionId : socket.findSessionId() });
		trivia.save(function(err, doc) {
			socket.sendMessage('triviaCreated', { triviaId : doc.id });
		});
	});
	
	socket.on('getMyTriviaByTriviaId', function(data) {
		Trivia.findOne({ _id :  mongoose.Types.ObjectId(data.triviaId), sessionId : clientInfoReverse[socket.id] }).exec(function(err, trivia){
			socket.sendMessage('myTrivia', trivia);
		});
	});
	
});

socketWrapper.messageCheck(config.messageCheckInterval);