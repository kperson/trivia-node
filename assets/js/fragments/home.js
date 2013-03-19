JS.require('JS.Observable', function() {
		HomeFragment = new JS.Class(Fragment, {
			setupVisual : function() {
				var curr = this;
				var view = { trivias : this.get('trivias') };
				this.bindToTemplate('/assets/templates/trivia-list.html', templateCache, function(template) {
					var content = template(view);
					$('#contentView').html(content);
					curr.visualComplete();
				});
				
			},            
		
			setupMessageEvents: function(){
				var curr = this;
				this.bindMessageEvent('myTrivias', function(trivias, isLocal){
					curr.set('trivias', trivias);
					curr.setupVisual();
					
				});
				
				this.bindMessageEvent('registerComplete', function(data, isLocal){
					curr.getTrivias();
				});
				
				this.bindMessageEvent('triviaSessionCreated', function(data, isLocal){
					curr.close();
					view.controlTrivia(data.shortCode);
				});				
				
				this.bindMessageEvent('triviaCreated', function(data, isLocal) {
					curr.close();
					view.displayTriviaEdit(data._id);
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
					curr.sendRemoteMessage('createdTriviaSession', { triviaId : id });
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
				var triviaView = { 'trivias' : this.get('trivias') };
				this.bindToTemplate('/assets/templates/trivia-list.html', templateCache, function(template) {
					var content = template(triviaView);
					$('#contentView').html(content);
					if(!(initLoad === undefined) && initLoad == true) {
						curr.visualComplete();
					}
				});             
			}
		});
});
