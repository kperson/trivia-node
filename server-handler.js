var fs = require('fs');
var indexFile;
var Handlebars = require('handlebars');
var indexCompiled;


function handler (req, res) {
	var lastChar = req.url.substring(req.url.length - 1, req.url.length);
	var fileToRead = req.url.substring(1, 7) == 'assets' || req.url == '/favicon.ico' ? req.url : '/index.html';
	var extMap = {  'mustache' : 'text/plain', 'gif' : 'image/gif', 'jpg' : 'image/jpeg', 'jpeg' : 'image/jpeg', 'png' : 'image/png', 'html' : 'text/html', 'ico' : 'image/x-icon', 'js' : 'application/javascript', 'css' : 'text/css', 'json' : 'application/json' };
	var data = fileToRead.split('.');
	var ext = data[data.length - 1].toLowerCase(); 
	var contentType = extMap[ext] == undefined ? extMap['html'] : extMap[ext];
  
	res.setHeader('X-UA-Compatible', 'IE=edge');
	if(fileToRead == '/index.html' && indexFile !== undefined){
		res.writeHead(200, {'Content-Type': contentType });
		res.end(indexFile);
	}
	else{
		fs.readFile(__dirname + fileToRead, 'utf-8', function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + fileToRead);
			}
			
			res.writeHead(200, {'Content-Type': contentType });
			if(fileToRead =='/index.html'){
				if(!indexCompiled || !config.cacheOn){
					indexCompiled = Handlebars.compile(data)
				}
				var rs = indexCompiled(config);
				res.end(rs);
			}
			else{
				res.end(data);				
			}
	  });
	}
}

module.exports.handler = handler;