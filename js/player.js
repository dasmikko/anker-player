function player(){}

// Player
player.Dom_player = $("#player");
player.Dom_player_source = $("#mp3_src");

player.updatePlayer = function(index) {

	var songUrl = playlist[index].url.replace('\\', '/');
	console.log(player.Dom_player[0]);
	//player.Dom_player_source.attr("src", songUrl);

	//player.Dom_player[0].pause();
    player.Dom_player[0].load();//suspends and restores all audio element
   	player.Dom_player[0].play();
}