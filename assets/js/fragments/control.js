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
				if(curr.get('shortCode') == data.shortCode){
					curr.set('session', data);
					$('#numberOfPlayers').html(curr.recountPlayers());
				}
			});
			
			this.bindMessageEvent('guestLeftTrivia', function(data) {
				if(curr.get('shortCode') == data.shortCode){
					curr.set('session', data);
					$('#numberOfPlayers').html(curr.recountPlayers());
				}
			});			
	
			
			this.bindMessageEvent('registerComplete', function(data, isLocal){
				curr.controlGame();
			});				
			
		},
		
		recountPlayers: function(){
			var ct = this.get('session').stats.count(function(row){
				return row.status == 'joined';
			});
			return this.set('numPlayers', ct);
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
