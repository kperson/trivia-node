function socketSend(key, value, sessionId, sendIn) {
	var sendTime = sendIn == undefined  ? 0 : sendIn;
	if(sessionId === undefined){
		if (clientInfoReverse[this.id] === undefined){
			sessionId = null;
		}
		else{
			sessionId = clientInfoReverse[this.id];
		}
	}
	
	var status = sessionId == null ? 'sent' : 'unsent';
	var msg = Message({ sessionId : sessionId, status : status });
	msg.put('messageKey', key);
	msg.put('data', value);

	var curr = this;
	msg.sendIn(sendTime, function(err, doc){
		if(err){
			console.log(err);
		}
		if(sessionId == null){
			console.log('Sending: ' +  JSON.stringify(doc.normalize()));
			curr.emit('message', doc.normalize());
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
	this.on('disconnect', function () {
		console.log('Disconnecting');
		var foundSessionId = this.findSessionId();
		if(foundSessionId != undefined){
			delete clientInfo[foundSessionId];
			delete clientInfoReverse[this.id];
			for(var i = 0; i < sessionIdList.length; i++){
				if(sessionIdList[i] == foundSessionId){
					sessionIdList.splice(i, 1);
					break;
				}
			}			
		}
	});
}

function messageCheck(time) {
	setInterval(function() {
		Message.dequeue(sessionIdList, function(err, msgs){
			if(!err){
				msgs.forEach(function(msg){
					if(clientInfo[msg.sessionId] != undefined){
						msg.markAsSent(function(err2, doc){
							try {
								io.sockets.sockets[clientInfo[msg.sessionId].socketId].emit('message', msg.normalize());
							}
							catch(err){
								console.log(err2);
							}
						});
					}
				});
			}
		});
	}, time);
}

	
module.exports.socketSend = socketSend;
module.exports.findSessionId = findSessionId;
module.exports.disconnect = disconnect;
module.exports.messageCheck = messageCheck;