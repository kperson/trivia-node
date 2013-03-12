JS.require('JS.Observable', function() {
		HomeFragment = new JS.Class(Fragment, {
			setupVisual : function() {
				var curr = this;
				var view = { trivias : this.get('trivias') };
				this.bindToTemplate('/assets/templates/trivia-list.html', templateCache, function(template) {
					var content = Mustache.render(template, view);
					$('#contentView').html(content);
					curr.visualComplete();
				});
				
			},            
		
			setupMessageEvents: function(){
				var curr = this;
				this.bindMessageEvent('myTrivias', function(trivias, isLocal){
					curr.set('trivias', trivias);
					modelCache.triviaList['home'] = trivias;
					curr.setupVisual();
					
				});
				
				this.bindMessageEvent('registerComplete', function(data, isLocal){
					curr.getTrivias();
				});
				
				this.bindMessageEvent('triviaCreated', function(data, isLocal) {
					var rs = [data].concat(curr.get('trivias'));
					curr.set('trivias', rs); 
					modelCache.triviaList['home'] = rs;
					view.displayTriviaEdit(data._id);
					curr.close();
				});             
			},
			setupDOMEvents : function() {
				var curr = this;
				this.bindDOMEvent('.edit-trivia', 'click', function(e){
					e.preventDefault();
					var triviaId = $(this).attr('id');
					var trivia = curr.get('trivias').select(function(x){
						return x._id == triviaId;
					})[0];
					view.displayTriviaEdit(trivia);
					curr.close();
				}); 
				
				this.bindDOMEvent('.delete-trivia', 'click', function(e){
					e.preventDefault();
					if(confirm("Are you sure you would like to delete this trivia?")){
						var id = $(this).attr('id');
						
						curr.deleteTrivia(id);
					}
				}); 

				this.bindDOMEvent('.play-trivia', 'click', function(e){
					e.preventDefault();
					var id = $(this).attr('data-trivia-id');
					view.playTrivia(id);
					// this.sendRemoteMessage('removeTrivia', { triviaId : triviaId });
				});
				
				this.bindDOMEvent('#create-trivia-btn', 'click', function(e){
					e.preventDefault();
					var triviaName = $.trim($('#trivia-name').val());
					if(triviaName != ''){
						var data = { triviaName : triviaName }; 
						curr.sendRemoteMessage('createTrivia', data); 
					}
					else{
						alert('Please insert a name');
					}
			
				});                         
			},
			
			getTrivias : function(){
				if(modelCache.triviaList['home'] === undefined){
					this.sendRemoteMessage('getMyTrivias', {  });
				}
				else{
					this.sendLocalMessage('myTrivias', modelCache.triviaList['home']);
				}
			},
			
			deleteTrivia : function(triviaId){
				var rs = this.get('trivias').select(function(x){
					return x._id != triviaId;
				});
				this.set('trivias', rs);
				modelCache.triviaList['home'] = rs;
				this.bindTrivia();
				this.sendRemoteMessage('removeTrivia', { triviaId : triviaId });
			},
			
			bindTrivia: function(initLoad){
				var curr = this;
				var view = { 'trivias' : this.get('trivias') };
				this.bindToTemplate('/assets/templates/trivia-list.html', templateCache, function(template) {
					var content = Mustache.render(template, view);
					$('#contentView').html(content);
					if(!(initLoad === undefined) && initLoad == true) {
						curr.visualComplete();
					}
				});             
			}
		});
});
