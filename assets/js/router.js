var ApplicationRouter = Backbone.Router.extend({
		routes: {
			'': 'home',
			'trivia/:id/edit/': 'editTrivia',
			'trivia/add': 'createTrivia',
			'p/:shortCode' : 'playTrivia',
			'c/:shortCode' : 'controlTrivia',
			
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

		playTrivia: function(shortCode) {
			playFragment = new PlayFragment(locBroadcaster,remoteSender);
			playFragment.set('shortCode', shortCode);
			playFragment.setupMessageEvents();				
			if(initFragment.get('isAuth')) { 
				playFragment.joinGame();
			}
		},
		
		controlTrivia: function(shortCode) {
			controlFragment = new ControlFragment(locBroadcaster,remoteSender);
			controlFragment.set('shortCode', shortCode);
			controlFragment.setupMessageEvents();				
			if(initFragment.get('isAuth')) { 
				controlFragment.controlGame();
			}
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
		this.router.navigate("p/" + id, true);
	},
	
	controlTrivia: function(id){
		this.router.navigate("c/" + id, true);
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
