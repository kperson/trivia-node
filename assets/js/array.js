Array.prototype.select = function(filter)
{
	var newArr = []
	for (var i = 0; i< this.length; i++) {
		if(filter(this[i])){
			newArr.push(this[i]);
		}
    }
	return newArr;
}

Array.prototype.map = function(mapFunction)
{
	var newArr = []
	for (var i = 0; i< this.length; i++) {
		newArr.push(mapFunction(this[i]));
    }
	return newArr;
}

Array.prototype.remove = function(filter)
{
	this.select(function(row){
		return !filter(row);
	});
}