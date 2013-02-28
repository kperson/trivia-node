function makeModels(Schema, mongoose) {
    var models = { };  
	
	/* Begin Trivia*/
	Trivia = new Schema({
		triviaName : String,
		questions : [
			{question : String, answers : [{ answerType : String, answer : String}], choices : [{ answerType : String, answer : String}]}
		]
    });	
	Trivia.methods.addQuestion = function(question, answers, choices, isText, callback){
		answerType = isText || isText ? 'text' : 'photo';
		var a = [];
		for(var i = 0; i < answers.length; i++){
			a.push({ answerType : answerType, answer : answers[i] });
		}
		
		var c = [];
		for(var i = 0; i < choices.length; i++){
			c.push({ answerType : answerType, answer : choices[i] });
		}		
		this.questions.push({ question : question, answers : a, choices : c });
		this.save(callback);
	};
	
	
	
	
	models['trivia'] = mongoose.model('trivia_trivia', Trivia);
	/* End Trivia*/
	
	
	/* Begin Trivia Session */
	TriviaSession = new Schema({
		trivia : { type : Schema.Types.ObjectId, ref : 'trivia_trivia' },
		shortCode : { type : String, index : { unique : false } },
		status : { type : String, default : 'open' },
		currentQuestionIndex : {  type : Number, default : 0 },
		creatorSessionId : String,
		stats : [
			{ playerName : String, sessionId : String, correct : { type : Number, default : 0 }, incorrect : { type : Number, default : 0 }, answerRecord : [Boolean] }
		]
	});
	
	TriviaSession.methods.checkIfCorrect = function(answer){
		var currentQuestion = trivia.questions[this.currentQuestionIndex];
		for(var i = 0; i < currentQuestion.answers.length; i++){
			if(answer.toLowerCase().trim() == currentQuestion.answers[i].toLowerCase().trim()){
				return true;
			}
		}
		return false;
	};
	
	TriviaSession.methods.startTrivia = function(callback){
		this.model('trivia_trivia_session').update({ _id : this._id }, { $set : { 'status' : 'playing' } }).exec(callback);
	};
	
	TriviaSession.methods.incrementQuestion = function(callback){
		if(this.currentQuestionIndex + 1 <= this.trivia.questions.length - 1) {
			this.model('trivia_trivia_session').update({ _id : this._id }, { $inc : { 'currentQuestionIndex' : 1 } }).exec(function(){
				callback(err, doc, true);
			});
		}
		else{
			this.model('trivia_trivia_session').update({ _id : this._id }, { $set : { 'status' : 'over' } }).exec(function(err, doc){
				callback(err, doc, false);
			});
		}

	};
	
	TriviaSession.methods.markAnswerCorrect = function(sessionId, isCorrect, callback){
		if(isCorrect){
			this.model('trivia_trivia_session').update({ _id : this._id, 'stats.sessionId' : sessionId }, { $inc : { 'stats.$.correct' : 1 }, $push : { 'stats.$.answerRecord' : isCorrect }  }).exec(callback);
		}
		else{
			this.model('trivia_trivia_session').update({ _id : this._id, 'stats.sessionId' : sessionId }, { $inc : { 'stats.$.incorrect' : 1 }, $push : { 'stats.$.answerRecord' : isCorrect }  }).exec(callback);
		}
	};

	TriviaSession.methods.transferSession = function(oldSessionId, newSessionId, callback){
		this.model('trivia_trivia_session').update({ _id : this._id, 'stats.sessionId' : oldSessionId }, { $set: { 'stats.$.sessionId': newSessionId } }).exec(callback);
	};	
	
	TriviaSession.methods.addNewPlayer = function(sessionId, playerName, callback){
		var finder = this;
		var Sess = models['session'];
		var gameSession = new Sess({ sessionId : sessionId, triviaSessionId : this._id, userType : 'player' });
		gameSession.save(function(err, doc){
			if(err){
				callback(err, doc);
				return;
			}
			else{
				var newStat = { playerName : playerName, sessionId : sessionId, answerRecord : [] };
				finder.model('trivia_trivia_session').update({ _id : this._id }, { $push: { stats: newStat } }).exec(callback);
			}
		});
	};	
	
	TriviaSession.methods.findStatsBySessionId = function(sessionId){
		for(var i = 0; i < this.stats.length; i++){
			if(this.stats[i].sessionId == sessionId){
				return this.stats[i];
			}
		}
		return null;
	};	
	
	models['trivia_session'] = mongoose.model('trivia_trivia_session', TriviaSession);
	/* End Trivia Session*/

	
	/* Begin Message */
	Message = new Schema({
		sessionId : { type : String, index : { unique : false } },
		status : {type : String, default : 'unsent' },
		lockId : { type : String, default : null },
		sendAt : Number,
		timeout : Number,
		messageExpiration : Number,
		messageVals : [{ key : String, value : Schema.Types.Mixed }],
	});
	
	Message.methods.put = function(key, value){
		this.messageVals.push({ key : key, value : value});
	};

	Message.methods.sendIn = function(seconds, callback) {
		var ts = Math.round((new Date()).getTime() / 1000);
		this.sendAt = ts + seconds;
		this.timeout = this.sendAt + 30;
		this.messageExpiration = this.sendAt + (60 * 5);
		this.save(callback);
	};
	
	Message.methods.markAsSent = function() {
		this.status = 'sent';
		this.save();
	};
	
	Message.methods.normalize = function(){
		var rs = { };
		for(var i = 0; i < this.messageVals.length; i++){
			item = this.messageVals[i];
			rs[item.key] = item.value;
		}
		return rs;
	};
	
	Message.statics.dequeue = function(sessionIds, callback) {
		var ts = Math.round((new Date()).getTime() / 1000);
		var query = { };
		query.sessionId =  { '$in' : sessionIds };
		query.sendAt = { '$lte' : ts };
		query.messageExpiration = { '$gte' : ts };
		query['$or'] = [ {status : 'unsent'}, { status : 'pending', timeout : { '$lte' : ts }}];
		
		var update = { };
		update.lockId = Math.random().toString(36).substr(2,16);
		update.status = 'pending';
		update.timeout = ts + 30;

		var finder = this;
		
		this.update(query, update, { multi: true }).exec(function(updateErr, doc){
			if(updateErr){
				callback(updateErr, doc);
				return;
			}
			finder.find({ lockId : update.lockId}).exec(function(findErr, messages) {
				callback(findErr, messages);
			});	
		});		
	};
	
	models['message'] =  mongoose.model('trivia_message', Message);
	/* End Message */
	
	
	/* Begin Session */
	Session = new Schema({
		sessionId : { type : String, index : { unique : false } },
		triviaSessionId : Schema.Types.ObjectId,
		userType : String,
		createdAt : {  type : Date, default : Date.now }
	});
	
	var sessionSchema = mongoose.model('trivia_session', Session);
	models['session'] = sessionSchema;
	/* End Session */	
	
	return models;
}

module.exports.make = makeModels;