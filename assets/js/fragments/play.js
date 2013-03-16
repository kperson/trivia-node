JS.require('JS.Observable', function() {
    PlayFragment = new JS.Class(Fragment, {

			setupVisual : function() {
				var curr = this;
				curr.set('numPlayers',0);
        this.bindToTemplate('/assets/templates/trivia-play.html', templateCache, function(template) {
          var content = Mustache.render(template, view);
          $('#contentView').html(content);
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

			},

		});
});
