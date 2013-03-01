var questions = [
	{ question : 'What is the capital on Indiana?', answer : 'Indianapolis', timeLimit : 8 },
	{ question : 'What is the square root of 49?', answer : '7', timeLimit : 6},
];

var currQuestionIndex = -1;
var gameStartsIn = 4;
var clientInfo = { };

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}


/*
io.sockets.emit - Everyone
socket.emit - Individual
socket.broadcast - Everyone except sender
io.sockets.sockets[socketId] - Find socketId and send to individual
*/

io.sockets.on('connection', function (socket) {
  clientInfo[socket.id] = { correct : 0, incorrect : 0 };	
  
  socket.emit('welcome', { message : 'Welcome!' });
  
  
  socket.on('answer', function (data) {
    var question = questions[data['index']];
	if(question['answer'].toLowerCase() == data['value'].toLowerCase()){
		clientInfo[socket.id].correct++;
		socket.emit('correct', { index : data['index'] });
	}
	else{
		clientInfo[socket.id].incorrect++;
		socket.emit('incorrect', { index : data['index'], answer : question['answer'] });
	}
  });
});

io.sockets.on('disconnect', function(socket) {
	//delete clientInfo[socket.id];
});

setTimeout(function() {
	askQuestion();
}, gameStartsIn * 1000);

var askQuestion = function() {
	currQuestionIndex++;
	if(currQuestionIndex < questions.length){
		question = questions[currQuestionIndex];
		question['index'] = currQuestionIndex;
		io.sockets.emit('question', question);
		setTimeout(askQuestion, question.timeLimit * 1000); 
	}
	else{
		for(var socketId in clientInfo){
			try{
				io.sockets.sockets[socketId].emit('over', { total : questions.length,  correct : clientInfo[socketId].correct, incorrect : clientInfo[socketId].incorrect });
			}
			catch(err){
				console.log(err);
			}
		}
	}
};