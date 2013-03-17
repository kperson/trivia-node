JS.require('JS.Observable', function() {
    PlayFragment = new JS.Class(Fragment, {

    	setupVisual : function() {
    		var curr = this;
		},

		setupMessageEvents: function() {
			var curr = this;
			this.bindMessageEvent('registerComplete', function(data, isLocal){
				curr.joinGame();
			});			
			
		},
		
		joinGame : function(){
			this.sendRemoteMessage('joinTrivia', { shortCode : this.get('shortCode')});
			this.setupVisual();
		}
	});
});
