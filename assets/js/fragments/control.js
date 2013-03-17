JS.require('JS.Observable', function() {
    ControlFragment = new JS.Class(Fragment, {

    	setupVisual : function() {
    		var curr = this;
			curr.set('numPlayers',0);
			this.bindToTemplate('/assets/templates/trivia-play.html', templateCache, function(template) {
				var localView = { playUrl :  curr.playUrl()};
				$('#contentView').html(template(localView));
				curr.visualComplete();
			});
		},

		setupMessageEvents: function() {
			var curr = this;
			
			this.bindMessageEvent('guestJoinedTrivia', function(data) {
				var num = curr.get('numPlayers') + 1;
				curr.set('numPlayers',num);
				$('#numberOfPlayers').html(num);
			});
			
			this.bindMessageEvent('registerComplete', function(data, isLocal){
				curr.controlGame();
			});				
			
		},
		
		controlGame: function(){
			this.setupVisual();
		},
		
		playUrl : function(){
			var port = window.location.port == '' ? '' : ':' + window.location.port;
			var url = window.location.protocol + '//' + window.location.hostname + port  + '/p/' + this.get('shortCode');
			return url;
		}
	});
});
