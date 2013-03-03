JS.require('JS.Observable', function() {

	 LocalBroadcaster = new JS.Class({
		include: JS.Observable,
		initialize: function() {
		}
	});
	
	Fragment = new JS.Class({ 
		
		initialize: function(localBroadcaster, remoteBroadcaster) {
			this.open = true;
			this.data = {};
			this.domEvents = [];
			this.messageBindEvents = [];
			this.localBroadcaster = localBroadcaster;
			this.remoteBroadcaster = remoteBroadcaster;
		},
		
		set: function(key, value) {
			console.log(value);
			this.data[key] = value;
		},
		
		get: function(key) {
			return this.data[key];
		},
		
		setup : function(localSend) {
			if(this.open) {
				this.setupVisual();
			}
		},
		visualComplete: function() {
			this.setupDOMEvents();
			this.setupMessageEvents();		
			this.setupComplete();
		},	
		
		setupVisual: function() {
		},
		
		setupDOMEvents: function() {
		},
		
		setupMessageEvents: function() {
		},	
		
		setupComplete: function(){
			
		},
		
		cleanUp : function() {
		},
		
		sendLocalMessage : function(key, payload) {
			if(this.open){
				this.localBroadcaster.notifyObservers({ messageKey : key, data : payload, isLocal : true });
			}
		},
		
		sendRemoteMessage: function(key, payload) {
			if(this.open) {
				this.remoteBroadcaster(key, payload);
			}
		},
		
		sendLocalAndRemoteMessage: function(key, payload) {
			this.sendLocalMessage(key, payload);
			this.sendRemoteMessage(key, payload);
		},
		
		bindDOMEvent : function(selector, eventType, callback) {
			if(this.open){
				this.domEvents.push({ selector : selector, eventType : eventType });
				$(selector).bind(eventType, callback);
			}
		},
	
		
		bindMessageEvent : function(messageKey, callback){
			if(this.open){
				
				var functionName = 'anonymous_f_' + this.messageBindEvents.length;
				this.messageBindEvents.push(functionName);
				this['__proto__'][functionName] = function(msg) {
					if(msg.messageKey == messageKey){
						callback(msg.data, msg.isLocal);
					}
				};
				this.localBroadcaster.addObserver(this.method(functionName));
			}
			
		},
		
		
		close : function(){
			this.close = false;
			for(var i = 0; i < this.domEvents.length; i++){
				$(this.domEvents[i].selector).unbind(this.domEvents[i].eventType);
			}
			
			for(var i = 0; i < this.messageBindEvents.length; i++){
				this.localBroadcaster.removeObserver(this.method(this.messageBindEvents[i]));
			}				
			this.cleanUp();
		}
	});
	
	Utility = new JS.Class({ 
		
		initialize: function(localBroadcaster, remoteBroadcaster) {	
		},
		
		randomString : function(len) {
		    var text = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < len; i++ )
		        text += possible.charAt(Math.floor(Math.random() * possible.length));

		    return text;	
		}
	});
	
});