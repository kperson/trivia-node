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

Array.prototype.count = function(filter)
{
	var ct = 0;
	for (var i = 0; i< this.length; i++) {
		if(filter(this[i])){
			ct++;
		}
    }
	return ct;
}

Array.prototype.selectOne = function(filter)
{
	for (var i = 0; i< this.length; i++) {
		if(filter(this[i])){
			return this[i];
		}
    }
	return null;
}

Array.prototype.yield = function(mapFunction)
{
	var newArr = []
	for (var i = 0; i< this.length; i++) {
		newArr.push(mapFunction(this[i]));
    }
	return newArr;
}

Array.prototype.remove = function(filter)
{
	return this.select(function(row){
		return !filter(row);
	});
}

Array.prototype.indexOfSelect = function(filter)
{
	for (var i = 0; i< this.length; i++) {
		if(filter(this[i])){
			return i;
		}
    }
	return -1;
}