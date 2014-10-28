// Load native UI library.
var gui = require('nw.gui');
var file = require('file');
var forEachAsync = require('forEachAsync').forEachAsync;
var id3js = require('id3js');
var path = require('path');
var fdialogs = require('node-webkit-fdialogs');

// Get this window
var win = gui.Window.get();

// Config for app


// Current playlist
var playlist = [];

// Current song
var songSrc = "";
var songName = "";
var currentIndex;

// States
var shuffle = false;
var repeatPlaylist = false;
var repeatSong = false;

/*
	Audio player code
 */
// Player state
var isPlaying = false;

// The player
var player = document.getElementById('player');

// On playing
player.addEventListener('playing', function() {
	isPlaying = true;
	songMaxDuration = player.duration;
	$('#playPauseToggle').addClass('playing');
});

// On play
player.addEventListener('play', function() {
	isPlaying = true;
});

// On paused
player.addEventListener('pause', function() 
{
	if(isPlaying)
	{
		isPlaying = false;
		$('#playPauseToggle').removeClass('playing');
	}
});

// Fires each ms the song plays
player.addEventListener("timeupdate", function(event)
{
	updateTime();
});

player.addEventListener('ended', function() {
	if(!repeatSong)
	{
		playNextSong();
	}
	else
	{
		player.play();
	}
});

function repeatToggle() {
	if(repeatPlaylist == false && repeatSong == false)
	{
		// Repeat playlist
		$('#repeatToggle').addClass("repeatPlaylist");
		$('#repeatToggle').text("Repeating Playlist");
		repeatPlaylist = true;
	}
	else if (repeatPlaylist == true && repeatSong == false)
	{
		// Repeat song only!
		$('#repeatToggle').removeClass("repeatPlaylist");
		$('#repeatToggle').addClass("repeatSong");
		$('#repeatToggle').text("Repeating Song");
		repeatPlaylist = false;
		repeatSong = true;
	}
	else
	{
		// Play playlist once
		$('#repeatToggle').removeClass("repeatPlaylist");
		$('#repeatToggle').removeClass("repeatSong");
		$('#repeatToggle').text("Repeat");
		repeatPlaylist = false;
		repeatSong = false;
	}
}

function shuffleToggle() {
	if(shuffle == false)
	{
		// Enable shuffle
		$('#shuffleToggle').addClass("active");
		shuffle = true;
	}
	else
	{
		// Disable shuffle
		$('#shuffleToggle').removeClass("active");
		shuffle = false;
	}

}


function playPauseToggle() {
	if(isPlaying)
		player.pause();
	else
		player.play();
}

function updateTime() 
{
	var currentPos = player.currentTime; //Get currenttime
	var maxduration = player.duration; //Get audio duration
	var percentage = 100 * currentPos / maxduration; //in %
	$('.timeBar').css('width', percentage+'%');


	var time = player.currentTime;
	var currentSeconds = parseInt(time % 60);
	if (currentSeconds < 10)
	{
		currentSeconds = "0" + currentSeconds;
	}

	var currentMinutes = parseInt((time / 60) % 60); 
	if (currentMinutes < 10)
	{
		currentMinutes = "0" + currentMinutes;
	}

	$("#currentSongDuration").text(currentMinutes + ":" + currentSeconds);


	var duration = player.duration;
	var durationSeconds = parseInt(duration % 60);
	if (durationSeconds < 10)
	{
		durationSeconds = "0" + durationSeconds;
	}

	var durationMinutes = parseInt((duration / 60) % 60);
	if (durationMinutes < 10)
	{
		durationMinutes = "0" + durationMinutes;
	}

	$("#SongDuration").text(durationMinutes + ":" + durationSeconds);

	// Set the time span
	//$("#time").text(currentMinutes + ':' + currentSeconds + ' / ' + durationMinutes + ':' + durationSeconds);
}


function updateSongInfo() {
	$('#songName').text(songName);
} 


// Enable progressbar dragging
var timeDrag = false;   /* Drag status */

// On progressbar mousedown
$('.progressBar').mousedown(function(e) {
	// Set dragging true
	timeDrag = true;

	// Update the progressbar
	updatebar(e.pageX);
});

// When we stop dragging
$(document).mouseup(function(e) {
	// Fire if we are dragging 
	if(timeDrag) {
		timeDrag = false;
		updatebar(e.pageX);
		player.play();
	}
});

// when we drag the bar
$(document).mousemove(function(e) {
	if(timeDrag) {
		updatebar(e.pageX);
	}
});

//update Progress Bar control
var updatebar = function(x) 
{
	var progress = $('.progressBar');
	var maxduration = player.duration; //Video duraiton
	var position = x - progress.offset().left; //Click pos
	var percentage = 100 * position / progress.width();

	//Check within range
	if(percentage > 100) 
	{
		percentage = 100;
	}

	if(percentage < 0) 
	{
		percentage = 0;
	}

	//Update progress bar and video currenttime
	$('.timeBar').css('width', percentage+'%');
	player.currentTime = maxduration * percentage / 100;
};

function playSong(index) {
	songSrc = playlist[index].url;
	if(playlist[index].artist != null)
	{
		songName = playlist[index].artist + " - " + playlist[index].title;
	}
	else
	{
		songName = playlist[index].fileName;
	}
	
	currentIndex = index;

	// Remove all classes
	$("#playlist li").removeClass('active');

	// Add class to currenct song
	$("#playlist li:eq("+ index +")").addClass('active');

	$("#player").attr("src", playlist[index].url);
	updateSongInfo();
}

function playNextSong() {
	// Get song count
	var playlistSongCount = playlist.length - 1;

	if(shuffle == true)
	{
		var nextSongIndex = Math.floor(Math.random() * playlist.length);
		$('#player').attr('src', playlist[nextSongIndex].url);

		if(playlist[nextSongIndex].artist != null)
		{
			songName = playlist[nextSongIndex].artist + " - " + playlist[nextSongIndex].title;
		}
		else
		{
			songName = playlist[nextSongIndex].fileName;
		}

		currentIndex = nextSongIndex;

		// Remove all classes
		$("#playlist li").removeClass('active');

		// Add class to currenct song
		$("#playlist li:eq("+ nextSongIndex +")").addClass('active');

		player.play();
		updateSongInfo();
	}
	else if(repeatPlaylist == false && currentIndex < playlistSongCount)
	{
		var nextSongIndex = currentIndex + 1
		$('#player').attr('src', playlist[nextSongIndex].url);
		if(playlist[nextSongIndex].artist != null)
		{
			songName = playlist[nextSongIndex].artist + " - " + playlist[nextSongIndex].title;
		}
		else
		{
			songName = playlist[nextSongIndex].fileName;
		}

		currentIndex = nextSongIndex;

		// Remove all classes
		$("#playlist li").removeClass('active');

		// Add class to currenct song
		$("#playlist li:eq("+ nextSongIndex +")").addClass('active');

		player.play();
		updateSongInfo();
	}
	else if(repeatPlaylist == true && currentIndex < playlistSongCount)
	{
		var nextSongIndex = currentIndex + 1
		$('#player').attr('src', playlist[nextSongIndex].url);
		if(playlist[nextSongIndex].artist != null)
		{
			songName = playlist[nextSongIndex].artist + " - " + playlist[nextSongIndex].title;
		}
		else
		{
			songName = playlist[nextSongIndex].fileName;
		}

		currentIndex = nextSongIndex;

		// Remove all classes
		$("#playlist li").removeClass('active');

		// Add class to currenct song
		$("#playlist li:eq("+ nextSongIndex +")").addClass('active');

		player.play();
		updateSongInfo();
	}
	else if(repeatPlaylist == true && playlistSongCount == currentIndex)
	{
		$('#player').attr('src', playlist[0].url);

		if(playlist[0].artist != null)
		{
			songName = playlist[0].artist + " - " + playlist[0].title;
		}
		else
		{
			songName = playlist[0].fileName;
		}

		currentIndex = 0;

		// Remove all classes
		$("#playlist li").removeClass('active');

		// Add class to currenct song
		$("#playlist li:eq("+ 0 +")").addClass('active');

		player.play();
		updateSongInfo();
	}
	
}

function playPrevSong() {
	// Get song count
	var playlistSongCount = playlist.length - 1;


	if(currentIndex != 0)
	{
		var prevSongIndex = currentIndex - 1
		$('#player').attr('src', playlist[prevSongIndex].url);
		songSrc = playlist[prevSongIndex].url;
		if(playlist[prevSongIndex].artist != null)
		{
			songName = playlist[prevSongIndex].artist + " - " + playlist[prevSongIndex].title;
		}
		else
		{
			songName = playlist[prevSongIndex].fileName;
		}

		currentIndex = prevSongIndex;

		// Remove all classes
		$("#playlist li").removeClass('active');

		// Add class to currenct song
		$("#playlist li:eq("+ prevSongIndex +")").addClass('active');

		player.play();
		updateSongInfo();
	}		
}


// Maximize state
var isMaximized = false;

// Register window states
win.on('maximize', function() {
	isMaximized = true;
});
win.on('unmaximize', function() {
	isMaximized = false;
});

// Get files from local music folder
function loadMusicFromOwnFolder() {
	// Reset playlist!
	playlist = [];

	file.walk('./music', function(isNullForSomeFuckingReason, dirPath, dirs, files)
	{

		forEachAsync(files, function(next, element, index, array) 
		{
			//Get ID3 info
			id3js({ file: element, type: id3js.OPEN_LOCAL }, function(err, tags) {
				
				// Escape hashtags and get absolute path
				var escaped_url = path.resolve(element).replace('#', '%23');
				
				playlist.push({
					artist: tags.artist,
					title: tags.title,
					url: escaped_url
				});	

				// Go to next element
				next();		
				
			});
			
		}).then(function () {
			updatePlaylistDOM();
    		//$apply();
	  	}); 
	});
}


// Get files from local music folder
function loadMusicFromFolder() {
	try 
	{
		chooseFolder('#folderDialog', function(path) {
			console.log("path " + path);

			// Reset playlist!
			playlist = [];

			if(path != "")
			{
				file.walk(path, function(isNullForSomeFuckingReason, dirPath, dirs, files)
				{
					forEachAsync(files, function(next, element, index, array) 
					{
						//Get ID3 info
						id3js({ file: element, type: id3js.OPEN_LOCAL }, function(err, tags) {
							
							//console.log(tags);
							// Escape hashtags and get absolute path
							//var escaped_url = path.resolve(element).replace('#', '%23');
							
							playlist.push({
								artist: tags.artist,
								title: tags.title,
								url: element
							});	

							// Go to next element
							next();		
							
						});
						
					}).then(function () {
						updatePlaylistDOM();
				  	}); 
				});
			}
			
		});
	}
	catch(err)
	{
		console.log(err)
	}
	
}




closeApp = function() {
	win.close();
}
maximizeToggleApp = function() {
	if(!isMaximized)
		win.maximize();
	else
		win.unmaximize();
}
minimizeApp = function() {
	win.minimize();
}

openDevTools = function() {
	win.showDevTools();
}

function chooseFolder(name, callback) 
{
    var chooser = $(name);
    chooser.change(function(evt) {
      
      callback($(this).val());

      // Reset the selected value to empty ('')
      $(this).val('');
    });

    chooser.trigger('click');  

    
}

var loadFromUrlVisible = false;

function loadFromUrlToggle()
{
	if(!loadFromUrlVisible) 
	{
		
		$('.loadFromUrl').stop().show();
		$('.loadFromUrl').removeClass('animated flipOutX');
		$('.loadFromUrl').addClass('animated flipInX');
		$('.loadFromUrl').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			loadFromUrlVisible = true;
		});
	}
	else
	{
		
		
		$('.loadFromUrl').removeClass('animated flipInX');
		$('.loadFromUrl').addClass('animated flipOutX');
		$('.loadFromUrl').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			loadFromUrlVisible = false;
			$('.loadFromUrl').stop().hide();
		});
		
	}
	
}

function AddUrlToPlaylist() {
	// Next index number
	var index = playlist.length;

	// URL input
	var theUrl = $('#url').val();

	playlist.push({
		artist: null,
		title: null,
		fileName: theUrl,
		url: theUrl
	});	

	// Create HTML variable
	var html = "";
	html += '<li class="animated bounceInDown" onclick="playSong(' + index + ')" data-index="' + index + '">';
	html += theUrl;
	html += '</li>';

	$("#playlist ul").append(html);
	loadFromUrlToggle();
	$('#url').val('');
}

function openFile() {
	var Dialog = new fdialogs.FDialog({
	    type: 'open',
	    accept: ['.mp3','.wav','.ogg']
	});

	Dialog.readFile(function (err, content, path) 
	{
		// Reset playlist
		playlist = [];

		//Get ID3 info
		id3js({ file: path, type: id3js.OPEN_LOCAL }, function(err, tags) {
			// Escape hashtags and get absolute path
			//var escaped_url = path.resolve(file).replace('#', '%23');
			
			playlist.push({
				artist: tags.artist,
				title: tags.title,
				url: path
			});	

			updatePlaylistDOM();	
		});
	});
}

function addFile(path) {
	var index = playlist.length;

	var fileName = path.match(/[^\\]*(?=\.[^.]+($|\?))/);

	//Get ID3 info
	id3js({ file: path, type: id3js.OPEN_LOCAL }, function(err, tags) {
		// Escape hashtags and get absolute path
		//var escaped_url = path.resolve(file).replace('#', '%23');
		playlist.push({
			artist: tags.artist,
			title: tags.title,
			fileName: fileName,
			url: path
		});	

		// Create HTML variable
		var html = "";
		html += '<li class="animated bounceInDown" onclick="playSong(' + index + ')" data-index="' + index + '">';
		if(tags.artist != null)
		{
			html += tags.artist + ' - ' + tags.title;
		}
		else
		{
			html += fileName;
		}
		
		html += '</li>';

		$("#playlist ul").append(html);
	});
}


	
	
function updatePlaylistDOM() {
	// Create HTML variable
	var html = "";
	
	forEachAsync(playlist, function(next, element, index, array) 
	{
		html += '<li class="animated bounceInDown" onclick="playSong(' + index + ')" data-index="' + index + '">';
		if(element.artist != null)
		{
			html += element.artist + ' - ' + element.title;
		}
		else
		{
			html += element.fileName;
		}
		html += '</li>';

		// Go to next element
		next();		
			
	}).then(function () 
	{
		$("#playlist ul").html('');
		$("#playlist ul").append(html);
  	});
}

function updatePlaylistDOMSilent() {
	// Create HTML variable
	var html = "";
	
	forEachAsync(playlist, function(next, element, index, array) 
	{
		html += '<li onclick="playSong(' + index + ')" data-index="' + index + '">';
		if(element.artist != null)
		{
			html += element.artist + ' - ' + element.title;
		}
		else
		{
			html += element.fileName;
		}
		html += '</li>';

		// Go to next element
		next();		
			
	}).then(function () 
	{
		$("#playlist ul").html('');
		$("#playlist ul").append(html);
  	});
}


var holder = document.getElementById('holder'); 

// prevent default behavior from changing page on dropped file
window.ondragover = function(e) { 
	e.preventDefault(); 
	holder.className = 'hover'; 
	return false;
};
window.ondrop = function(e) { 
	e.preventDefault(); 
	holder.className = ''; 
	return false; };


holder.ondragover = function () { 
	this.className = 'hover'; 
	return false; 
};
holder.ondragleave = function () { 
	this.className = ''; 
	return false; 
};
holder.ondrop = function (e) {
	this.className = '';
	e.preventDefault();

	for (var i = 0; i < e.dataTransfer.files.length; ++i) {
		console.log(e.dataTransfer.files[i].path);
		addFile(e.dataTransfer.files[i].path);
	}
	return false;
};



/*
	Right click menu
 */

// Tracking which element was clicked on
var rightClickedSongIndex = 0;

// Context menu for paragraphs
var paraMenu = new gui.Menu();

// Context sub-menu for paragraph styles
var paraStyleMenu = new gui.Menu();

// [entry] Remove a paragraph
paraMenu.append(new gui.MenuItem({
    label: 'Remove from playlist',
    click: function(){
        playlist.splice(rightClickedSongIndex, 1);
        updatePlaylistDOM();

    }
}));



$(document.body).on('contextmenu', function(e){

	e.preventDefault();

	console.log(e);

	if (e.target.localName == 'li')
	{
		rightClickedSongIndex = e.target.attributes[1].value;
		paraMenu.popup(e.clientX, e.clientY);
	}

});

