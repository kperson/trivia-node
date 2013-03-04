function setupSocket(socket, socketWrapper){
	socket.sendMessage = socketWrapper.socketSend.bind(socket);
	socket.findSessionId = socketWrapper.findSessionId.bind(socket);
	socket.disconnect = socketWrapper.disconnect.bind(socket);
	socket.reRegister = socketWrapper.reRegister.bind(socket);
	socket.registerClient = socketWrapper.registerClient.bind(socket);
	socket.disconnect();
	socket.reRegister();
	socket.registerClient();
}
module.exports.setupSocket = setupSocket;