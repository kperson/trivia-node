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
		var trivia = new Trivia({triviaName : name, sessionId : socket.findSessionId(), createdAt :  Math.round((new Date()).getTime() / 1000) });
		trivia.save(function(err, doc) {
			socket.sendMessage('triviaCreated', doc );
		});
	});
	
	socket.on('getMyTriviaByTriviaId', function(data) {
		Trivia.findByTriviaIdSessionId(data.triviaId, socket.findSessionId(), function(err, trivia){
			socket.sendMessage('myTrivia', trivia);			
		});
	});
	
	socket.on('getMyTrivias', function(data){
		Trivia.find({ sessionId : socket.findSessionId() }).sort('-createdAt').exec(function(err, trivias){
			socket.sendMessage('myTrivias', trivias);
		});
	});
	
	socket.on('updateTrivia', function(data){
		Trivia.findByTriviaIdSessionId(data.triviaId, socket.findSessionId(), function(err, trivia){
			var choices = [];
			var answers = [];
			for(var key in data.update.items){
				var item = data.update.items[key];
				if(item.isCorrect){
					answers.push(item.value);
				}
				choices[parseInt(key)] = item.value;
			}

			trivia.addQuestion(data.update.question, answers, choices, true, data.update.questionIndex);
			trivia.fillNull(data.questionIndex, null);
			
			
			Trivia.update( { _id : trivia._id }, { '$set' : { questions :  trivia.questions } }).exec(function(err, savedTrivia) {
				socket.sendMessage('triviaUpdated', trivia);	
				socket.sendMessage('questionModified', trivia);	
			});
		});		
	});
	
	socket.on('removeQuestion', function(data){
		Trivia.findByTriviaIdSessionId(data.triviaId, socket.findSessionId(), function(err, trivia){
			trivia.questions.splice(data.questionIndex, 1);
			trivia.save(function(err, doc){
				socket.sendMessage('triviaUpdated', trivia);								
			});
		});
	});
	
	socket.on('removeTrivia', function(data){
		Trivia.findByTriviaIdSessionId(data.triviaId, socket.findSessionId(), function(err, trivia){
			trivia.remove(function(err, trivia){
				socket.sendMessage('triviaRemoved', data);
			});	
		});	
	});
	
});

socketWrapper.messageCheck(config.messageCheckInterval);