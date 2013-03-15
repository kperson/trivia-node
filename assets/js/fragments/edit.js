	
	EditFragment = new JS.Class(Fragment, {
			setupVisual : function(){
				var curr = this;
				$('title').html(this.get('trivia').triviaName);
				$('#title').html(this.get('trivia').triviaName);
				this.bindToTemplates(['/assets/templates/trivia-edit.html', '/assets/templates/question.html', '/assets/templates/edit-region.html'], templateCache, function(templates){
					var trivia = curr.get('trivia');
					var content = templates[0](trivia);
					$('#contentView').html(content);
					$('#questionArea').html(templates[1]({}));
					$('.question-box').html(templates[2]({}));
					curr.set('currQuestionIndex', trivia.questions.length);
					

					curr.visualComplete();      
				});
				
			},
			
			bindToQuestionIndex: function(index){
				var trivia = this.get('trivia');
				this.clearForm();
				
				$('#delete').hide();
				if(trivia.questions[index] !== undefined){
					$('#delete').show();
					$('.is-correct').attr('checked', false);  
					$('#question-text').val(trivia.questions[index].question);            
					for(var i = 0; i < trivia.questions[index].choices.length; i++){
						var answer = trivia.questions[index].choices[i].answer; 
						var isCorrect = false;
						if(answer !== undefined){
							isCorrect = trivia.questions[index].answers.select(function(row){
								return row.answer == answer
							}).length > 0;  
						}

			
						$('.question-box').eq(i).find('.question-edit').html(answer);
						if(isCorrect){
							$('.question-box').eq(i).find('.is-correct').trigger('click');
						}

					}
				} 
			},
			setupMessageEvents : function(){
				
				var curr = this;
				this.bindMessageEvent('myTrivia', function(trivia, isLocal) {
					if(trivia._id == curr.get('triviaId')){
						
						curr.set('trivia', trivia);
						curr.setupVisual();
					}
				});
				
				this.bindMessageEvent('registerComplete', function(data, isLocal){
					curr.getTrivia();
				});
				
				
				this.bindMessageEvent('triviaUpdated', function(data, isLocal){
					curr.set('trivia', data);
					curr.bindToTemplates(['/assets/templates/trivia-edit.html', '/assets/templates/question.html', '/assets/templates/edit-region.html'], templateCache, function(templates){
						var trivia = curr.get('trivia');
						var content = Handlebars.compile(templates[0])(trivia);
						$('#contentView').html(content);
						$('#questionArea').html(templates[1]);
						$('.question-box').html(templates[2]);
						curr.bindToQuestionIndex(curr.get('currQuestionIndex'));

					});

				});
			

				
			},
			setupDOMEvents: function(){
				var curr = this;

				
				this.bindDOMEvent('#save', 'click', function(e){
					e.preventDefault();
					var data = curr.readGrid();
					data.questionIndex = curr.get('currQuestionIndex');
					if(data.question == null){
						alert('Please enter a question!');
					}
					else{
						curr.sendRemoteMessage('updateTrivia', { triviaId : curr.get('trivia')._id, update : data });
					}
				});
				
				this.bindDOMEvent('#delete', 'click', function(e){
					e.preventDefault();
					
					curr.sendRemoteMessage('removeQuestion', { triviaId : curr.get('trivia')._id, questionIndex : curr.get('currQuestionIndex') });
					var trivia = curr.get('trivia');
					trivia.questions.splice(curr.get('currQuestionIndex'), 1);
					curr.set('currQuestionIndex', trivia.questions.length);
				});             
				
				this.bindDOMEvent('.question-page', 'click', function(e){
					e.preventDefault();
					var index = $(this).attr('id');
					curr.set('currQuestionIndex', index);
					curr.bindToQuestionIndex(index);
				});
				
				this.bindDOMEvent('#new-question', 'click', function(e){
					e.preventDefault();               
					var trivia = curr.get('trivia');
					curr.set('currQuestionIndex', trivia.questions.length);
					curr.bindToQuestionIndex(trivia.questions.length);
					
					

				});
			}, 

			clearForm: function(){
				$('.question-edit').html('');
				$('#question-text').val('');            
				$('.is-correct').attr('checked', false);  
			},
								
			getTrivia : function(){
				if(modelCache.trivia[this.getTriviaId] === undefined){
					this.sendRemoteMessage('getMyTriviaByTriviaId', { triviaId : this.get('triviaId') });
				}
				else{
					this.sendLocalMessage('myTrivia', modelCache.trivia[this.getTriviaId]);
				}
			},
			
			readGrid: function(){
				var items = { };
				$('.boxy').each(function(index){
					var value = $.trim($(this).find('.question-edit').val());
					if(value != ''){
						items[index] = { value : value, isCorrect : $(this).find('input[name=is-correct]').is(':checked')};
					}
				});   
				var questionText = $.trim($('#question-text').val());
				if(questionText == ''){
					questionText = null;
				}
				var rs = {items : items, question : questionText };
				return rs;
			}
			
		});

