var sys = require('sys');
var fs = require('fs');
var UglifyJS = require("uglify-js");
var cleanCSS = require('clean-css');
var parseString = require('xml2js').parseString;
var Handlebars = require('handlebars');

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
		
		var indexTemplate = Handlebars.compile(fs.readFileSync('index.html', 'utf-8'));
		var index = indexTemplate({ cacheOn : false });
		var my_scripts = [];
		var css_links = [];
		parseString(index, function (err, result) {
			var body = result.html.body[0];
			var scripts = result.html.head[0].script;
			var links = result.html.head[0].link;
			
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

			for(var c = 0; c < links.length; c++){
				var link = links[c]['$'];
				if(link !== undefined && ('href' in link)){
					var file = link.href.substring(1, link.href.length);
					css_links.push(file);
				}
			}

		});
				
		
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
	
		
		var cssGroup = '';
		for(var z = 0; z < css_links.length; z++){
			cssGroup += fs.readFileSync(css_links[z], 'utf-8');
		}
		var minifiedCSS = cleanCSS.process(cssGroup);
		fs.writeFileSync(compressedCss, minifiedCSS);
		

	});
});