// Load native UI library.
var gui = require('nw.gui');
var file = require('file');
var forEach = require('async-foreach').forEach;

var playlist = [];

file.walk('./music', function(isNullForSomeFuckingReason, dirPath, dirs, files)
{
	forEach(files, function(item, index, arr) {
		playlist.push(item);
		console.log(item);
	});

	console.log(playlist);
});