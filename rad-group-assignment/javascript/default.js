var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var playlist = [];
var originPlaylist = [];
var playlist_pos = 0;
var shuffle = false;
var loop = false;
var loop_one = false;
var search = false;
var suggestCallBack;

function _(id) {
	return document.getElementById(id);
}

function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
      	height: '250',
      	width: '390',
      	playerVars: {
				'rel': 0,
      		'autoplay': 0,
				'controls': 0,
				'showinfo': 0,
				'modestbranding': 1
      	},
      	events: {
      		'onStateChange': onPlayerStateChange
      	}
    });
}

function onPlayerStateChange(event) {
	var timer;
	if (event.data == YT.PlayerState.PLAYING) {
		$(".play").each(function() {
			if ($(this).attr('attr-query') == $("#playing_query").val() && $(this).attr('id') == $("#playing_track").val()) {
				$(this).css("background", "url(pics/icons/pause.png)");
				$(this).css("background-size", "19px 22px");
			}
		});
		$("#play").css("background", "url(pics/icons/pause_circle.png)");
		$("#play").css("background-size", "40px 40px");
			var playerTotalTime = Math.round(player.getDuration());
			_("progressbar").max = playerTotalTime;
			$("#totaltime").html(calculateTime(playerTotalTime));
			timer = setInterval(function() {
			var playerCurrentTime = player.getCurrentTime();
			_("progressbar").stepUp((Math.round(playerCurrentTime) - _("progressbar").value));
			$("#playtime").html(calculateTime(playerCurrentTime));
			}, 1000);      
	}
	else if (event.data == YT.PlayerState.ENDED) {
		clearTimeout(timer);
		$(".play").each(function() {
			if ($(this).attr('attr-query') == $("#playing_query").val() && $(this).attr('id') == $("#playing_track").val()) {
				$(this).css("background", "url(pics/icons/play_v1_grey.png)");
				$(this).css("background-size", "19px 22px");
			}
		});
		$("#play").css("background", "url(pics/icons/play_grey.png)");
		$("#play").css("background-size", "40px 40px");
		if (loop_one) {
			switchSong($("#playing_track").val());
		}
		if (shuffle) {
			if (playlist_pos < playlist.length - 1) {
				$("#next").trigger("click");
			}
		}
		if (loop) {
			$("#next").trigger("click");
		}
	} 
	else if (event.data == YT.PlayerState.PAUSED) {	
		$(".play").each(function() {
			if ($(this).attr('attr-query') == $("#playing_query").val() && $(this).attr('id') == $("#playing_track").val()) {
				$(this).css("background", "url(pics/icons/play_v1.png)");
				$(this).css("background-size", "19px 22px");
			}
		});
		$("#play").css("background", "url(pics/icons/play.png)");
		$("#play").css("background-size", "40px 40px");
	}
	else if (event.data == -1) {
		clearTimeout(timer);
		$(".play").each(function() {
			if ($(this).attr('attr-query') == $("#playing_query").val() && $(this).attr('id') == $("#playing_track").val()) {
				$(this).css("background", "url(pics/icons/play_v1_grey.png)");
				$(this).css("background-size", "19px 22px");
			}
		});
		$("#play").css("background", "url(pics/icons/play_grey.png)");
		$("#play").css("background-size", "40px 40px");
	}
	else {
		clearTimeout(timer);	
	}
	}

	function playerSwitch(playbutton, player_video_id, videoId, query, thumbnail, song_name, song_artist) {
		if (player_video_id == videoId && query == $("#playing_query").val()) {
		// player state
		// -1  unstarted
		// 0  ended
		// 1  playing
		// 2  paused
		// 3  buffering
		// 5 video cued
		if (player.getPlayerState() == -1 || player.getPlayerState() == 5 || player.getPlayerState() == 0) {
			$("#playing_track").val(videoId);
			$("#playing_query").val(query);
			$("#playing_track_name").val(song_name);
				$("#playing_track_artist").val(song_artist);
			$("#selected_track").val(videoId);
			$("#selected_track_thumbnail").val(thumbnail);
			$("#selected_track_name").val(song_name);
			$("#selected_track_artist").val(song_artist);
			$(".play").css("background", "url(pics/icons/play_v1_grey.png)");
			$(".play").css("background-size", "19px 22px");
			switchSong(videoId);
			if (playbutton) {
				playbutton.css("background", "url(pics/icons/pause.png)");
				playbutton.css("background-size", "19px 22px");
			}
		}
		else if (player.getPlayerState() == 2) {
			playVideo();
			playbutton.css("background", "url(pics/icons/pause.png)");
			playbutton.css("background-size", "19px 22px");
		}
		else {
			pauseVideo();
			playbutton.css("background", "url(pics/icons/play_v1.png)");
			playbutton.css("background-size", "19px 22px");
		}
	}
	else {
		$.ajax({
			type: "POST",
			url: "/listening",
			cache: false,
			data: "queryString="+ query +"&videoID="+ videoId +"&thumbnail="+ thumbnail +"&track="+ song_name +"&artist=" + song_artist,
			success: function(data) {
				$.ajax({
					type: "POST",
					url: "/searchYoutube",
					cache: false,
					data: "query=" + query,
					success: function(data) {
						var result = data.split('<joelamltc>');
						printLyrics(result[2]);
					}
				});
			}
		});
		$("#playing_track").val(videoId);
		$("#playing_query").val(query);
		$("#playing_track_name").val(song_name);
			$("#playing_track_artist").val(song_artist);
		$("#selected_track").val(videoId);
		$("#selected_track_thumbnail").val(thumbnail);
		$("#selected_track_name").val(song_name);
		$("#selected_track_artist").val(song_artist);
		$(".play").css("background", "url(pics/icons/play_v1_grey.png)");
		$(".play").css("background-size", "19px 22px");
		switchSong(videoId);
		if (playbutton) {
			playbutton.css("background", "url(pics/icons/pause.png)");
			playbutton.css("background-size", "19px 22px");
		}
	}
	}

	function printLyrics(plainLyrics) {
		var lyrics = '';
		lyricsSplit = plainLyrics.split("\n");
	for (var i = 0; i < lyricsSplit.length; i++) {
		lyrics += lyricsSplit[i] + "<br>";
	}
	$("div.lyrics").html(lyrics);
	}

	$(document).on("click", ".play", function() {
		var query = $(this).attr("attr-query");
		var id = $(this).attr("id");
		var thumbnail = $(this).attr("attr-thumbnail");
		var song_name;
		var song_artist;
	var playbutton = $(this);
	var player_video_id = (typeof player.getVideoData().video_id === 'undefined') ? '' : player.getVideoData().video_id;

	if ($("#resultContainer").find(".record").length > 0) {
		song_name = $.trim($(this).closest(".record").find(".song_name").html());
		song_artist = $.trim($(this).closest(".record").find(".song_artist a").html());
	}
	else if ($("#artistResultContainer").find(".record").length > 0) {
		song_name = $.trim($(this).closest(".record").find(".trackName").html());
			song_artist = $.trim($("#artistName").html());
	}

		if (id) {
			playerSwitch(playbutton, player_video_id, id, query, thumbnail, song_name, song_artist);
		}
		else {
		$.ajax({
			type: "POST",
			url: "/searchYoutube",
			cache: false,
			data: "query=" + query,
			success: function(data) {
				var result = data.split('<joelamltc>');
				var videoId = result[0];
				var n_thumbnail = result[1];
				playbutton.attr("attr-thumbnail", n_thumbnail)
				playbutton.attr("id", videoId);
				playerSwitch(playbutton, player_video_id, videoId, query, n_thumbnail, song_name, song_artist);
				printLyrics(result[2]);
			}
		});
	}

	if (search) {
		var tracks;
		playlist = [];
		originPlaylist = [];
		if ($("#resultContainer").find(".record").length > 0) {
			tracks = $(this).closest("#resultContainer").find(".record");
		}
		else if ($("#artistResultContainer").find(".record").length > 0) {
			tracks = $(this).closest("#artistResultContainer").find(".record");
		}
		var counter = 0;
		tracks.each(function() {
			var playbutton = $(this).find(".button_play button")
			var trackid = playbutton.attr("id");
			var query = playbutton.attr("attr-query");
			var name;
			var artist;
			if ($("#resultContainer").find(".record").length > 0) {
				name = $.trim($(this).find(".song_name").html());
				artist = $.trim($(this).find(".song_artist a").html());
			}
			else if ($("#artistResultContainer").find(".record").length > 0) {
				name = $.trim($(this).find(".trackName").html());
				artist = $.trim($("#artistName").html());
			}
			if (trackid) {
				var thumbnail = playbutton.attr("attr-thumbnail");
				var track = {};
				track["trackid"] = trackid;
				track["thumbnail"] = thumbnail;
				track["query"] = query;
				track["name"] = name;
				track["artist"] = artist;
				playlist[counter++] = track;
			}
			else {
				var track = {};
				track["query"] = query;
				track["name"] = name;
				track["artist"] = artist;
				playlist[counter++] = track;
			}
		});
		if (shuffle) {
			originPlaylist = playlist.slice();
			playlist = shuffleArray(playlist);
		}
		for (var i = 0; i < playlist.length; i++) {
			if (playlist[i].query == query) {
				playlist_pos = i;
				break;
			}
		}

		if (playlist_pos > 0) {
			$("#prev").attr("attr-prev", JSON.stringify(playlist[playlist_pos - 1]));
		}
		else {
			if (loop) {
				$("#prev").attr("attr-prev", JSON.stringify(playlist[playlist.length - 1]));
			}
			else {
				$("#prev").attr("attr-prev", "");
			}
		}

		if (playlist_pos < playlist.length - 1) {
			$("#next").attr("attr-next", JSON.stringify(playlist[playlist_pos + 1]));
		}
		else {
			if (loop) {
				$("#next").attr("attr-next", JSON.stringify(playlist[0]));
			}
			else {
				$("#next").attr("attr-next", "");
			}
		}
		search = false;
	}
	else {
		if (playlist_pos > 0) {
			$("#prev").attr("attr-prev", JSON.stringify(playlist[playlist_pos - 1]));
		}
		else {
			if (loop) {
				$("#prev").attr("attr-prev", JSON.stringify(playlist[playlist.length - 1]));
			}
			else {
				$("#prev").attr("attr-prev", "");
			}
		}
		if (playlist_pos < playlist.length - 1) {
			$("#next").attr("attr-next", JSON.stringify(playlist[playlist_pos + 1]));
		}
		else {
			if (loop) {
				$("#next").attr("attr-next", JSON.stringify(playlist[0]));
			}
			else {
				$("#next").attr("attr-next", "");
			}
		}
	}
});

$("#next").click(function() {
	var next = JSON.parse($(this).attr("attr-next"));
	var player_video_id = (typeof player.getVideoData().video_id === 'undefined') ? '' : player.getVideoData().video_id;
	var playlist_query = '';

	if (next.trackid) {
		var query = next.query;
		$.ajax({
			type: "POST",
			url: "/searchYoutube",
			cache: false,
			data: "query=" + query,
			success: function(data) {
				var result = data.split('<joelamltc>');
				var videoId = next.trackid;
				var n_thumbnail = next.thumbnail;
				var playbutton;
				var track_playbtn;
				if ($("#resultContainer").find(".record").length > 0) {
					track_playbtn = $("#resultContainer").find("button.play");
				}
				else if ($("#artistResultContainer").find(".record").length > 0) {
					track_playbtn = $("#artistResultContainer").find("button.play");
				}
				for (var i = 0; i < playlist.length; i++) {
					if (playlist[i].query == query) {
						playlist_pos = i;
						playlist_query = playlist[i].query;
						break;
					}
				}
				track_playbtn.each(function() {
					if ($(this).attr("attr-query") == playlist_query) {
						playbutton = $(this);
						return false;
					}
				});
				playerSwitch(playbutton, player_video_id, videoId, query, n_thumbnail, next.name, next.artist);
				printLyrics(result[2]);
				$("#prev").attr("attr-prev", JSON.stringify(playlist[playlist_pos - 1]));
				if (playlist_pos < playlist.length - 1) {
					$("#next").attr("attr-next", JSON.stringify(playlist[playlist_pos + 1]));
				}
				else {
					if (loop) {
						$("#next").attr("attr-next", JSON.stringify(playlist[0]));
					}
					else {
						$("#next").attr("attr-next", "");
					}
				}
			}
		});
	}
	else {
		var query = next.query;
		$.ajax({
			type: "POST",
			url: "/searchYoutube",
			cache: false,
			data: "query=" + query,
			success: function(data) {
				var result = data.split('<joelamltc>');
				var videoId = result[0];
				var n_thumbnail = result[1];
				var playbutton;
				var track_playbtn;
				if ($("#resultContainer").find(".record").length > 0) {
					track_playbtn = $("#resultContainer").find("button.play");
				}
				else if ($("#artistResultContainer").find(".record").length > 0) {
					track_playbtn = $("#artistResultContainer").find("button.play");
				}							for (var i = 0; i < playlist.length; i++) {
					if (playlist[i].query == query) {
						playlist_pos = i;
						playlist_query = playlist[i].query;
						break;
					}
				}
				track_playbtn.each(function() {
					if ($(this).attr("attr-query") == playlist_query) {
						playbutton = $(this);
						return false;
					}
				});
				if (playbutton) {
					playbutton.attr("attr-thumbnail", n_thumbnail);
					playbutton.attr("id", videoId);
				}
				playerSwitch(playbutton, player_video_id, videoId, query, n_thumbnail, next.name, next.artist);
				printLyrics(result[2]);
				$("#prev").attr("attr-prev", JSON.stringify(playlist[playlist_pos - 1]));
				if (playlist_pos < playlist.length - 1) {
					$("#next").attr("attr-next", JSON.stringify(playlist[playlist_pos + 1]));
				}
				else {
					if (loop) {
						$("#next").attr("attr-next", JSON.stringify(playlist[0]));
					}
					else {
						$("#next").attr("attr-next", "");
					}
				}
			}
		});
	}
});

$("#prev").click(function() {
	var prev = JSON.parse($(this).attr("attr-prev"));
	var player_video_id = (typeof player.getVideoData().video_id === 'undefined') ? '' : player.getVideoData().video_id;
	var playlist_query = '';

	if (prev.trackid) {
		var query = prev.query;
		$.ajax({
			type: "POST",
			url: "/searchYoutube",
			cache: false,
			data: "query=" + query,
			success: function(data) {
				var result = data.split('<joelamltc>');
				var videoId = prev.trackid;
				var n_thumbnail = prev.thumbnail;
				var playbutton;
				var track_playbtn;
				if ($("#resultContainer").find(".record").length > 0) {
					track_playbtn = $("#resultContainer").find("button.play");
				}
				else if ($("#artistResultContainer").find(".record").length > 0) {
					track_playbtn = $("#artistResultContainer").find("button.play");
				}							for (var i = 0; i < playlist.length; i++) {
					if (playlist[i].query == query) {
						playlist_pos = i;
						playlist_query = playlist[i].query;
						break;
					}
				}
				track_playbtn.each(function() {
					if ($(this).attr("attr-query") == playlist_query) {
						playbutton = $(this);
						return false;
					}
				});
				playerSwitch(playbutton, player_video_id, videoId, query, n_thumbnail, prev.name, prev.artist);
				printLyrics(result[2]);
				if (playlist_pos > 0) {
					$("#prev").attr("attr-prev", JSON.stringify(playlist[playlist_pos - 1]));
				}
				else {
					if (loop) {
						$("#prev").attr("attr-prev", JSON.stringify(playlist[playlist.length - 1]));
					}
					else {
						$("#prev").attr("attr-prev", "");
					}
				}
				$("#next").attr("attr-next", JSON.stringify(playlist[playlist_pos + 1]));
			}
		});
	}
	else {
		var query = prev.query;
		$.ajax({
			type: "POST",
			url: "/searchYoutube",
			cache: false,
			data: "query=" + query,
			success: function(data) {
				var result = data.split('<joelamltc>');
				var videoId = result[0];
				var n_thumbnail = result[1];
				var playbutton;
				var track_playbtn;
				if ($("#resultContainer").find(".record").length > 0) {
					track_playbtn = $("#resultContainer").find("button.play");
				}
				else if ($("#artistResultContainer").find(".record").length > 0) {
					track_playbtn = $("#artistResultContainer").find("button.play");
				}							for (var i = 0; i < playlist.length; i++) {
					if (playlist[i].query == query) {
						playlist_pos = i;
						playlist_query = playlist[i].query;
						break;
					}
				}
				track_playbtn.each(function() {
					if ($(this).attr("attr-query") == playlist_query) {
						playbutton = $(this);
						return false;
					}
				});
				if (playbutton) {
					playbutton.attr("attr-thumbnail", n_thumbnail);
					playbutton.attr("id", videoId);
				}
				playerSwitch(playbutton, player_video_id, videoId, query, n_thumbnail, prev.name, prev.artist);
				printLyrics(result[2]);
				if (playlist_pos > 0) {
					$("#prev").attr("attr-prev", JSON.stringify(playlist[playlist_pos - 1]));
				}
				else {
					if (loop) {
						$("#prev").attr("attr-prev", JSON.stringify(playlist[playlist.length - 1]));
					}
					else {
						$("#prev").attr("attr-prev", "");
					}
				}
				$("#next").attr("attr-next", JSON.stringify(playlist[playlist_pos + 1]));
			}
		});
	}
});

function mouseupProgressbar(bar) {
	player.seekTo(bar.value, true);
};

function mousemoveProgressbar(bar) {
	player.seekTo(bar.value, false);
};

$("#hide").click(function() {
	var height = $(window).height() - 75 - 60;
	if ($("#player").is(":visible")) {
		$("#player").fadeOut(function() {
			$(".lyrics").animate({height : height + "px"});
		});
		$(this).css("background", "url(/pics/icons/mini.png)");
		$(this).css("background-size", "20px 20px");
	}
	else {
		$(".lyrics").animate({height : (height - 285) + "px"}, function() {
			$("#player").fadeIn();
		});
		$(this).css("background", "url(/pics/icons/mini_grey.png)");
		$(this).css("background-size", "20px 20px");
		$(this).removeAttr("style");
	}
});

$("#mute").click(function() {
	var volume = $("#volume").val();
	if (volume > 0) {
		$(this).attr("src", "/pics/icons/mute.png");
		$(this).attr("data-vol", volume);
		player.mute();						
		$("#volume").val(0);
	}
	else {
		$(this).attr("src", "/pics/icons/sound.png");
		player.unMute();
		$("#volume").val($(this).attr("data-vol"));
	}
});

$("#shuffle").click(function() {
	if (shuffle) {
		shuffle = false;
		$(this).css("background", "url(/pics/icons/random_grey.png)");
		$(this).css("background-size", "25px 25px");
		$(this).removeAttr("style");
		playlist = originPlaylist.slice();
	}
	else {
		shuffle = true;
		$(this).css("background", "url(/pics/icons/random.png)");
		$(this).css("background-size", "25px 25px");
		originPlaylist = playlist.slice();
		playlist = shuffleArray(playlist);
	}
});

$("#loop").click(function() {
	if (loop) {
		loop = false;
		$(this).css("background", "url(/pics/icons/repeat_grey.png)");
		$(this).css("background-size", "30px 30px");
		$(this).removeAttr("style");
	}
	else {
		loop = true;
		$(this).css("background", "url(/pics/icons/repeat.png)");
		$(this).css("background-size", "30px 30px");
	}

	loop_one = false;
	$("#loop_one").css("background", "url(/pics/icons/loop_one_grey.png)");
	$("#loop_one").css("background-size", "30px 30px");
	$("#loop_one").removeAttr("style");
});

$("#loop_one").click(function() {
	if (loop_one) {
		loop_one = false;
		$(this).css("background", "url(/pics/icons/loop_one_grey.png)");
		$(this).css("background-size", "30px 30px");
		$(this).removeAttr("style");
	}
	else {
		loop_one = true;
		$(this).css("background", "url(/pics/icons/loop_one.png)");
		$(this).css("background-size", "30px 30px");
	}

	loop = false;
	$("#loop").css("background", "url(/pics/icons/repeat_grey.png)");
	$("#loop").css("background-size", "30px 30px");
	$("#loop").removeAttr("style");
});

$("#play").click(function() {
	if (player.getPlayerState() == 2 || player.getPlayerState() == -1 || player.getPlayerState() == 0) {
		playVideo();
	}
	else {
		pauseVideo();
	}
});

function playVideo() {
	player.playVideo();
}

function pauseVideo() {
	player.pauseVideo();
}

function stopVideo() {
	player.stopVideo();
}

function switchSong(videoId) {
	_("progressbar").value = 0;
	$("#playing_track_info").html($("#selected_track_artist").val() + "<br>" + $("#selected_track_name").val()).hide().fadeIn(1000);
	$("#playing_track_thumbnail").attr("src", $("#selected_track_thumbnail").val()).hide().fadeIn(1000);
	$("#add_playing_track").fadeIn(1000);
	player.loadVideoById(videoId, 0, "small");
}

function volume_tooltip() {
	player.setVolume(_("volume").value);
}

function calculateTime(s) {
	sec = pad(Math.floor(s % 60));
	min = pad(Math.floor(s / 60) % 60);
	return min + ":" + sec;
}

function pad(num, size) {
	var s = String(num);
	while (s.length < (size || 2)) {
		 s = '0' + s;
	}
	return s;
}

function shuffleArray(array) {
    var counter = array.length, temp, index;
    while (counter > 0) {
        index = Math.floor(Math.random() * counter);
        counter--;
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

$(document).ready(function(){
	$(".form-control").focus();
	$("#playing_track_thumbnail").hide();
	$("#playing_track_info").hide();
	$("#add_playing_track").hide();
	$body = $("body");

	$(document).on({
	    ajaxStart: function(event) { if (event.target.activeElement.id != "key_words") { $body.addClass("loading"); }},
	    ajaxStop: function(event) { if (event.target.activeElement.id != "key_words") { $body.removeClass("loading"); }}   
	});

	$("#key_words").autocomplete({
        source: function(request, response) {
            $.getJSON("http://suggestqueries.google.com/complete/search?callback=?",
                { 
                  "hl":"en",
                  "ds":"yt",
                  "jsonp":"suggestCallBack",
                  "q":request.term,
                  "client":"youtube"
                }
            );
            suggestCallBack = function (data) {
                var suggestions = [];
                $.each(data[1], function(key, val) {
                    suggestions.push({"value":val[0]});
                });
                suggestions.length = 10;
                response(suggestions);
            }
        }
    });

	$(document).on("click", ".ui-menu-item", function() {
		$("#searchField").trigger("submit");
	});

	$("#searchField").submit(function(event){
		event.preventDefault();
		var keyWords = $(this).find('input[name="key_words"]').val();

		$(".ui-autocomplete").css("display", "none");

		$(".playlist_content").each(function() {
			$(this).removeClass("selected_playlist");
			$(this).find(".playlist_icon img").attr("src", "/pics/icons/music_grey.png");
		});
		$(".suggestlist").removeClass("selected_playlist");
		$(".suggestlist").find(".playlist_icon img").attr("src", "/pics/icons/music_grey.png");

		$.ajax({
			type: "POST",
			url: "/result",
			cache: false,
			data: "key_words=" + keyWords,
			success: function(data) {
				$("#content").html(data).hide();
				$("#content").fadeIn(1000);
				search = true;
			},
			beforeSend: function() {
				$body.addClass("loading");
			},
			complete: function() {
				$body.removeClass("loading");
			}
		});
	});

	$(document).on("click", ".song_artist a",function(event){
		event.preventDefault();
		var artist = $(this).attr("attr-artist-name");

		$.ajax({
			type: "POST",
			url: "/artist",
			cache: false,
			data: "artist_name=" + artist,
			success: function(data) {
				var array = data.split("<CCYK>");
				$('#content').html(array[1]).hide();
				$('#artistTitle').css("background-image","url("+ array[0] +")");
				$('#content').fadeIn(1000);
				search = true;
			}
		});
	});

	$("#add_playlist").mouseover(function() {
		$(this).css("color", "#1DD760");
		$(this).find("img").attr("src", "/pics/icons/plus_circle.png");
	}).mouseout(function() {
		$(this).css("color", "#FFFAFA");
		$(this).find("img").attr("src", "/pics/icons/plus_circle_grey.png");
	});

	$(document).on("mouseover", ".playlist_content, .suggestlist", function() {
		$(this).find(".playlist_icon > img").attr("src", "/pics/icons/music.png");
	}).on("mouseout", ".playlist_content, .suggestlist", function() {
		if ($(this).hasClass("selected_playlist")) {
			$(this).find(".playlist_icon > img").attr("src", "/pics/icons/music.png");
		}
		else {
			$(this).find(".playlist_icon > img").attr("src", "/pics/icons/music_grey.png");
		}
	});

	$(".suggestlist").click(function(event) {
		event.preventDefault();
		$(".playlist_content").each(function() {
			$(this).removeClass("selected_playlist");
			$(this).find(".playlist_icon img").attr("src", "/pics/icons/music_grey.png");
		});
		$(this).addClass("selected_playlist");
		$(this).find(".playlist_icon img").attr("src", "/pics/icons/music.png");

		$.ajax({
			type: "POST",
			url: "/playlist",
			cache: false,
			data: "action=displaySuggestlistDetail",
			success: function(data) {
				$("#content").html(data).hide();
				$("#content").fadeIn(1000);
				search = true;
			}
		});
	});

	$("#add_playlist").click(function() {
		var offset = $(this).offset();
		$("#select_playlist").focusout();
		if ($("#new_playlist_name").is(":visible")) {
			$("#new_playlist_name").fadeOut();
		}
		else {
			$("#new_playlist_name").css("left", (offset.left + 201) + "px").fadeIn(function() {
				$("#playlist_name_field").focus();
			});
		}
	});

	$("#submit_playlist_name").click(function() {
		var playlist_name = $("#playlist_name_field").val();
		if (playlist_name != '') {
			$.ajax({
				type: "POST",
				url: "/playlist",
				cache: false,
				data: "action=addPlaylist&data=" + playlist_name,
				success: function(data) {
					var template = data.split("<joelamltc>");
					var playlist = $("#playlist_container div:last").parent().attr("class");
					var select_playlist = $("#select_playlist div.select_playlist_container:last");

					if (playlist == "playlist_content") {
						$("#playlist_container div.playlist_content:last").after(template[0]);
					}
					else {
						$("#playlist_container div.suggestlist:last").after(template[0]);
					}

					if (select_playlist.attr("class") == "select_playlist_content") {
						$("#select_playlist div.select_playlist_content:last").after(template[1]);
					}
					else {
						$("#select_playlist div.select_playlist_container").append(template[1]);
					}

					$("#playlist_container").scrollTop($("#playlist_container").height());
					$("#playlist_container div.playlist_content:last").hide().fadeIn(1000);
					$("#select_playlist div.select_playlist_content:last").hide().fadeIn(1000);
					$("#playlist_name_field").val("");
					$("#new_playlist_name").fadeOut();
				}
			});	
		}
	})

	$(document).on("click", ".playlist_content", function(event) {
		event.preventDefault();
		var playlist_id = $(this).find(".playlist_name").attr("attr-playlist-id");
		var name = $(this).find(".playlist_name a").html();

		$(".playlist_content").each(function() {
			$(this).removeClass("selected_playlist");
			$(this).find(".playlist_icon img").attr("src", "/pics/icons/music_grey.png");
		});
		$(".suggestlist").removeClass("selected_playlist");
		$(".suggestlist").find(".playlist_icon img").attr("src", "/pics/icons/music_grey.png");
		$(this).addClass("selected_playlist");
		$(this).find(".playlist_icon img").attr("src", "/pics/icons/music.png");

		$.ajax({
			type: "POST",
			url: "/playlist",
			cache: false,
			data: "action=displayPlaylistDetail&data=" + playlist_id + "&name=" + name,
			success: function(data) {
				$("#content").html(data).hide();
				$("#content").fadeIn(1000);
				search = true;
			}
		});
	});

	$(document).on("click", "#delete_playlist", function() {
		var name = $.trim($(this).closest("#title").text());
		if (confirm("Are you sure to delete the PLAYLIST \""+ name +"\"?")) {
			var playlist_id = $(this).attr("attr-id");
			$.ajax({
				type: "POST",
				url: "/playlist",
				cache: false,
				data: "action=deletePlaylist&data=" + playlist_id,
				success: function(data) {
					$("#content").children().fadeOut(1000, function() {
						$("#content").empty();
					});
					$("div[attr-playlist-id="+ data +"]").closest(".playlist_content").fadeOut(1000, function() {
						$(this).remove();
					});
				}
			});
		}
	});

	$("#select_playlist").focusout(function () {
	    setTimeout(function() {
	    	var focus = $(document.activeElement);
	    	if (focus.is("#select_playlist") || $('#select_playlist').has(focus).length) {
	    		// console.log("still focused");
	        } else {
	    		$("#select_playlist").fadeOut(500);
	        }
	    },0);     
	 });

	$(document).on("click", ".add", function(event) {
		if (event.target.id == "add_playing_track") {
			$("#selected_track").val($("#playing_track").val());
			$("#selected_track_thumbnail").val($("#playing_track_thumbnail").attr("src"));
			$("#selected_track_name").val($("#playing_track_name").val());
			$("#selected_track_artist").val($("#playing_track_artist").val());
		}
		else {
			var playbutton = $(this).closest(".record").find(".button_play button");	
			var video_id = playbutton.attr("id");

			if (typeof video_id === 'undefined') {
				var query = playbutton.attr("attr-query");
				$.ajax({
					type: "POST",
					url: "/searchYoutube",
					cache: false,
					data: "query=" + query,
					success: function(data) {
						var result = data.split('<joelamltc>');
						var videoId = result[0];
						var thumbnail = result[1];
						playbutton.attr("id", videoId);
						playbutton.attr("attr-thumbnail", thumbnail);
						$("#selected_track").val(videoId);
						$("#selected_track_thumbnail").val(thumbnail);

						var selected_track_name = $.trim($("#" + videoId).closest(".record").find(".song_name").html());
						if (selected_track_name) {
							$("#selected_track_name").val(selected_track_name);
							$("#selected_track_artist").val($.trim($("#" + videoId).closest(".record").find(".song_artist a").html()));
						}
						else {
							$("#selected_track_name").val($.trim($("#" + videoId).closest(".record").find(".trackName").html()));
							$("#selected_track_artist").val($.trim($("#artistName").html()));
						}
					}
				});
			}
			else {
				var videoId = playbutton.attr("id");
				var thumbnail = playbutton.attr("attr-thumbnail");
				$("#selected_track").val(videoId);
				$("#selected_track_thumbnail").val(thumbnail);

				var selected_track_name = $.trim($("#" + videoId).closest(".record").find(".song_name").html());
				if (selected_track_name) {
					$("#selected_track_name").val(selected_track_name);
					$("#selected_track_artist").val($.trim($("#" + videoId).closest(".record").find(".song_artist a").html()));
				}
				else {
					$("#selected_track_name").val($.trim($("#" + videoId).closest(".record").find(".trackName").html()));
					$("#selected_track_artist").val($.trim($("#artistName").html()));
				}
			}
		}

		var offset = $(this).offset();
		var high = $(window).height() - 60;
		if ($("#select_playlist").is(":visible")) {
			$("#select_playlist").fadeOut(500);
		}
		else {
			if (offset.top < high - 200) {
				$("#select_playlist").css({"left" : (offset.left + $(this).width() + 13) , "top" : (offset.top + $(this).height()), "outline" : 0}).attr("tabindex", -1).fadeIn(500).focus();
			}
			else {
				$("#select_playlist").css({"left" : (offset.left + $(this).width() + 13) , "top" : (high - 200), "outline" : 0}).fadeIn(500).focus();
			}
		}
	});

	$(document).on("click", ".select_playlist", function(event) {
		event.preventDefault();
		var playlist_id = $(this).attr("attr-playlist-id");
		var video_id = $("#selected_track").val();
		var track_name = $("#selected_track_name").val();
		var track_artist = $("#selected_track_artist").val();
		var thumbnail = $("#selected_track_thumbnail").val();
		console.log(playlist_id + " " + video_id + " " + track_name + " " + track_artist + " " + thumbnail);

		if (playlist_id && video_id && track_name && track_artist && thumbnail) {
			$.ajax({
				type: "POST",
				url: "/playlist",
				cache: false,
				data: "action=addTrackToPlaylist&data=" + playlist_id + "&video_id=" + video_id + "&track_name=" + track_name + "&track_artist=" + track_artist + "&thumbnail=" + thumbnail,
				success: function(data) {
					var timer;
					var counter = 0;
					var result = data.split("<joelamltc>");
					var playlist_token = $("#playlist_token").val();

					$("#select_playlist").fadeOut(500);
					timer = setInterval(function() {
						if (counter == 10) {
							clearTimeout(timer);
							$("div.playlist_name[attr-playlist-id=" + result[0] + "]").parent().removeAttr("style");
						}
						else if (counter % 2 == 0){
							$("div.playlist_name[attr-playlist-id=" + result[0] + "]").parent().css("background", "#171717");
							counter++;
						}
						else {
							$("div.playlist_name[attr-playlist-id=" + result[0] + "]").parent().css("background", "#272727");
							counter++;
						}
					}, 100);

					if (playlist_token == result[0]) {
						if ($("#resultContainer div.record:last").length == 0) {
							$("#resultContainer").html(result[1]);
							$("#resultContainer div.record:last").hide().fadeIn(1000);
						}
						else {
							$("#resultContainer div.record:last").after(result[1]);
							$("#resultContainer div.record:last").hide().fadeIn(1000);
						}
					}
				}
			});
		}
	});

	$(document).on("click", ".delete", function() {
		var track = $.trim($(this).closest(".record").find(".song_name").text());
		if (confirm("Are you sure to delete TRACK \""+ track +"\"?")) {
			var track_id = $(this).attr("attr-id");
			var playlist_id = $("#delete_playlist").attr("attr-id");
			var deletebutton = $(this);
			$.ajax({
				type: "POST",
				url: "/playlist",
				cache: false,
				data: "action=deleteTrack&data=" + track_id + "&playlist=" + playlist_id,
				success: function(data) {
					deletebutton.parent().parent().fadeOut(1000, function() {
						$(this).remove();
					});
				}
			});
		}
	});
});