var sys = require('sys');
var fs = require('fs');
var UglifyJS = require("uglify-js");
var cleanCSS = require('clean-css');
var $ = require('jquery');
var jsdom = require("jsdom");
var parseString = require('xml2js').parseString;


namespace('build', function () {
	desc('This is the bar task');
	task('bar', [], function () {
		
		var templates = 'assets/js/templates.js';
		var compressedJs = 'assets/js/compressed.js';
		var lastScript = 'assets/js/logic.js';
		var compressedCss = 'assets/css/compressed.css'
		var templateDir = 'assets/templates';
		
		if(fs.existsSync(templates)){
			fs.unlinkSync(templates);
		}
		if(fs.existsSync(compressedJs)){		
			fs.unlinkSync(compressedJs);
		}
		if(fs.existsSync(compressedCss)){				
			fs.unlinkSync(compressedCss);
		}
		if(fs.existsSync(lastScript)){				
			fs.unlinkSync(lastScript);
		}		
		
		
		
		var index = fs.readFileSync('index.html', 'utf-8');
		my_scripts = [];
		parseString(index, function (err, result) {
			//console.log(err);
			var scripts = result.html.head[0].script;
			for(var i = 0; i < scripts.length; i++){
				
				var script = scripts[i]['$'];
				if(scripts[i]['_'] !== undefined && scripts[i]['_'] != '/assets/js/jsclass-min'){
				
					fs.writeFileSync(lastScript, scripts[i]['_']);
				}
				
				if(script !== undefined) {
					if(('src' in script)){
						if(script.src.indexOf('/assets') == 0){
							var file = script.src.substring(1, script.src.length);
							my_scripts.push(file);
						}
					}
				} 
				 
			}

		});
		
		//console.log(my_scripts);
		
		
		var templateJs = 'templateCache = {};';
		var files = fs.readdirSync('assets/templates');
		
		for(var i = 0; i < files.length; i++){
			var file = 'assets/templates/' + files[i];			
			var fileContents = '';
			fs.readFileSync(file, 'utf-8').toString().split('\n').forEach(function(line){
				var my_line = line.trim();
				if(my_line != ''){
					fileContents += my_line;
				}
			});
			templateJs += "\ntemplateCache['/" + file + "']=" + "Handlebars.compile('" + fileContents  + "');"; 
		}
		
		fs.writeFileSync(templates, templateJs);
		my_scripts.push(templates);
		my_scripts.push(lastScript);
	
	
		var rs = UglifyJS.minify(my_scripts);
		fs.writeFileSync(compressedJs, rs.code);
	
		
		
		var s1 = fs.readFileSync('assets/css/normalize.css', 'utf-8');
		var s2 = fs.readFileSync('assets/css/foundation.css', 'utf-8');
		var s3 = fs.readFileSync('assets/css/main.css', 'utf-8');
		var minifiedCSS = cleanCSS.process(s1 + s2 + s3);
		fs.writeFileSync(compressedCss, minifiedCSS);
		

	});
});