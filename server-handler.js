var fs = require('fs');

function handler (req, res) {
	var lastChar = req.url.substring(req.url.length - 1, req.url.length);
	var fileToRead = req.url.substring(1, 7) == 'assets' || req.url == '/favicon.ico' ? req.url : '/index.html';
	var extMap = { 'gif' : 'image/gif', 'jpg' : 'image/jpeg', 'jpeg' : 'image/jpeg', 'png' : 'image/png', 'html' : 'text/html', 'ico' : 'image/x-icon', 'js' : 'application/javascript', 'css' : 'text/css', 'json' : 'application/json' };
	var data = fileToRead.split('.');
	var ext = data[data.length - 1].toLowerCase(); 
	var contentType = extMap[ext] == undefined ? extMap['html'] : extMap[ext];
  
	fs.readFile(__dirname + fileToRead, function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading ' + fileToRead);
		}
		res.setHeader('X-UA-Compatible', 'IE=edge');
		res.writeHead(200, {'Content-Type': contentType });
		res.end(data);
  });
}

module.exports.handler = handler;