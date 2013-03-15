 
			$(document).ready(function() {
				
					
					utility = new Utility();
					var socket = io.connect('http://localhost:8080');
					//var socket = io.connect('http://4d5i.localtunnel.com:80')
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
					
					initFragment = new InitFragment(locBroadcaster, remoteSender);
					initFragment.setup();
					initFragment.sendRemoteMessage('reRegister', { });
					
					view = new ApplicationView();
				
			});
		