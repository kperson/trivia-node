function utility(){
	var fns = { };
	fns.randomString = function(len) {
		var text = "";
	    var possible = "abcdefghijklmnopqrstuvwxyz123456789123456789";
	    for( var i=0; i < len; i++){
	    	text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return text;	
	}
	return fns;
}
module.exports.utility = utility;