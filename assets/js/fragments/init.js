JS.require('JS.Observable', function() {
	InitFragment = new JS.Class(Fragment, {
			
			initialize : function(){
				this.callSuper();
				this.set('isAuth', false);
			},
				
			setupMessageEvents : function(){
				var curr = this;
				this.bindMessageEvent('requestRegister', function(data, isLocal){
						if($.cookie('registerClient') == undefined){
						var id = utility.randomString(32);
						$.cookie('registerClient', id, { expires: 365, path: '/' });
					}
					else{
						$.cookie('registerClient', $.cookie('registerClient'), { expires: 365, path: '/' });
					}
					curr.sendRemoteMessage('registerClient', { sessionId : $.cookie('registerClient') });
				});
				
				this.bindMessageEvent('triviaUpdated', function(data, isLocal){
					if(modelCache.triviaList['home'] !== undefined){
						var index = modelCache.triviaList['home'].indexOfSelect(function(row){
							return row._id == data._id
						});
						if(index != -1){                    
							modelCache.triviaList['home'][index] = data;
						}
					}
				});
				
				this.bindMessageEvent('registerComplete', function(data, isLocal){
					curr.set('isAuth', true);
				});
				
				this.bindMessageEvent('triviaCreated', function(data, isLocal){
					var rs = [data].concat(modelCache.triviaList['home']);
					modelCache.triviaList['home'] = rs;
				});
				
				this.bindMessageEvent('myTrivias', function(trivias, isLocal){
					modelCache.triviaList['home'] = trivias;
				});				
				
			},
			
			setupVisual : function() {
				this.visualComplete();
			},
			
			setupComplete: function(){
				}
			
		});

});