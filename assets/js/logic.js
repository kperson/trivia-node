 
			$(document).ready(function() {
					utility = new Utility();
					var socket = io.connect('http://localhost:8080');
					remoteSender = function(key, data) {
						socket.emit(key, data);
					};		
					if(typeof(templateCache) == 'undefined'){
						templateCache = { };
					}
					modelCache =  { trivia : { }, triviaList : { } };

					locBroadcaster = new LocalBroadcaster();
					socket.on('message', function(data){
						console.log(data);
						locBroadcaster.notifyObservers({ messageKey : data.messageKey, data : data.data, isLocal : false });
					});
					
					socket.on('reconnect', function(data){
						window.location.reload();
					});
					
					initFragment = new InitFragment(locBroadcaster, remoteSender);
					initFragment.setup();
					initFragment.sendRemoteMessage('reRegister', { });
					
					view = new ApplicationView();
				
			});
		