var sys = require('sys');
var fs = require('fs');
var UglifyJS = require("uglify-js");
var cleanCSS = require('clean-css');
var parseString = require('xml2js').parseString;
var Handlebars = require('handlebars');

namespace('build', function () {
	desc('This is the bar task');
	task('cache', [], function () {
	});
});