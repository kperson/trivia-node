var ApplicationRouter = Backbone.Router.extend({
		routes: {
			'': 'home',
			'trivia/:id/edit/': 'editTrivia',
			'trivia/:id/play/': 'playTrivia',
			'trivia/add': 'createTrivia',
		},

		home: function() {
			$('title').html('My Trivia'); 
			$('#title').html('My Trivia');          
			var homeFragment = new HomeFragment(locBroadcaster, remoteSender);
			homeFragment.setupMessageEvents();
			if(initFragment.get('isAuth')) { 
					homeFragment.getTrivias();
				}
		},
		
		
		createTrivia: function() {
			var createFragment = new CreateFragment(locBroadcaster, remoteSender);
			createFragment.setup();
		$('title').html('Create Trivia');           
		},

		editTrivia: function(triviaId) {
			var editFragment = new EditFragment(locBroadcaster, remoteSender);
			editFragment.set('triviaId', triviaId);
			editFragment.setupMessageEvents();
			if(initFragment.get('isAuth')) { 
					editFragment.getTrivia();
				}
		},

		playTrivia: function(triviaId) {
			// console.log(triviaId);
		},

		updateTrivia: function(triviaId) {
			
		}

}); 

var ApplicationView = Backbone.View.extend({

	initialize: function(){
		this.router = new ApplicationRouter();
		Backbone.history.start({pushState: true});
	},

	displayHome: function(){
		this.router.navigate("home", true);
	},

	playTrivia: function(id){
		this.router.navigate("trivia/" + id + "/play/", true);
	},
	
	displayTriviaEdit: function(triviaOrTriviaId){
		var id;
		if(typeof(triviaOrTriviaId) != 'string'){
			modelCache.trivia[this._id] = triviaOrTriviaId;
			id = triviaOrTriviaId._id;
		}
		else{
			id = triviaOrTriviaId
		}
		this.router.navigate("trivia/" + id + "/edit/", true);
	}       

});
