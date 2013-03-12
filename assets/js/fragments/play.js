JS.require('JS.Observable', function() {
    PlayFragment = new JS.Class(Fragment, {

			setupVisual : function() {
				var curr = this;
        this.bindToTemplate('/assets/templates/trivia-play.html', templateCache, function(template) {
          var content = Mustache.render(template, view);
          $('#contentView').html(content);
          curr.visualComplete();
        });
			},

			setupMessageEvents: function() {
			},

		});
});	
