function socketSend(key, value, sessionId, sendIn) {
	var sendTime = sendIn === undefined  ? 0 : sendIn;
	if(sessionId === undefined){
		if (clientInfoReverse[this.id] === undefined){
			sessionId = null;
		}
		else{
			sessionId = clientInfoReverse[this.id];
		}
	}
	
	var status = sessionId == null || !(clientInfo[sessionId] === undefined) ? 'sent' : 'unsent';
	var msg = Message({ sessionId : sessionId, status : status });
	msg.put('messageKey', key);
	msg.put('data', value);

	var curr = this;
	msg.sendIn(sendTime, function(err, doc){
		if(err){
			console.log(err);
		}
		if(status == 'sent'){
			console.log('Sending: ' +  JSON.stringify(doc.normalize()));
			if(sessionId == null){
				setTimeout(function(){ curr.emit('message', doc.normalize());}, sendIn * 1000); 
			}
			else{
				setTimeout(function(){ 
					if(!(clientInfo[sessionId] === undefined)){
						try{
							io.sockets.sockets[clientInfo[doc.sessionId].socketId].emit('message', doc.normalize());
						}
						catch(err){
							doc.status = 'unsent';
							var ts = Math.round((new Date()).getTime() / 1000);
							doc.sendAt = ts;
							doc.timeout = this.sendAt + 30;
							doc.messageExpiration = this.sendAt + (60 * 4);
							doc.save();
							console.log(err);
						}
					}
				}, sendIn * 1000); 				
			}
		}
		else{
			console.log('Queueing: ' +  JSON.stringify(doc.normalize()));				
		}
	});	
}

function findSessionId(){
	return clientInfoReverse[this.id];
}

function disconnect() {
	console.log('Disconnecting');
	var foundSessionId = this.findSessionId();
	if(foundSessionId !== undefined){
		delete clientInfo[foundSessionId];
		delete clientInfoReverse[this.id];
		for(var i = 0; i < sessionIdList.length; i++){
			if(sessionIdList[i] == foundSessionId){
				sessionIdList.splice(i, 1);
				break;
			}
		}			
	}
}

function messageCheck(time) {
	setInterval(function() {
		Message.dequeue(sessionIdList, function(err, msgs){
			if(!err){
				msgs.forEach(function(msg){
					if(clientInfo[msg.sessionId] !== undefined){
						msg.markAsSent(function(err2, doc){
							try {
								io.sockets.sockets[clientInfo[msg.sessionId].socketId].emit('message', msg.normalize());
							}
							catch(err){
								msg.status = 'unsent';
								var ts = Math.round((new Date()).getTime() / 1000);
								msg.sendAt = ts;
								msg.timeout = this.sendAt + 30;
								msg.messageExpiration = this.sendAt + (60 * 4);
								msg.save();
								console.log(err2);
							}
						});
					}
				});
			}
		});
	}, time);
}

function registerClient() {
	this.on('registerClient', function(data){
		sessionIdList.push(data.sessionId);
		clientInfo[data.sessionId] = { socketId : this.id };	
		clientInfoReverse[this.id] = data.sessionId;	
		this.sendMessage('registerComplete', { });
	});	
}

function reRegister() {
	this.on('reRegister', function(data) {
		this.sendMessage('requestRegister', { });
	});	
}


	
module.exports.socketSend = socketSend;
module.exports.findSessionId = findSessionId;
module.exports.disconnect = disconnect;
module.exports.messageCheck = messageCheck;
module.exports.registerClient = registerClient;
module.exports.reRegister = reRegister;