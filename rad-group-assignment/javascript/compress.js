var tag=document.createElement("script");tag.src="https://www.youtube.com/iframe_api";var firstScriptTag=document.getElementsByTagName("script")[0];firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);var player,playlist=[],originPlaylist=[],playlist_pos=0,shuffle=!1,loop=!1,loop_one=!1,search=!1,suggestCallBack;function _(a){return document.getElementById(a)}
function onYouTubeIframeAPIReady(){player=new YT.Player("player",{height:"250",width:"390",playerVars:{rel:0,autoplay:0,controls:0,showinfo:0,modestbranding:1},events:{onStateChange:onPlayerStateChange}})}
function onPlayerStateChange(a){var b;a.data==YT.PlayerState.PLAYING?($(".play").each(function(){$(this).attr("attr-query")==$("#playing_query").val()&&$(this).attr("id")==$("#playing_track").val()&&($(this).css("background","url(pics/icons/pause.png)"),$(this).css("background-size","19px 22px"))}),$("#play").css("background","url(pics/icons/pause_circle.png)"),$("#play").css("background-size","40px 40px"),a=Math.round(player.getDuration()),_("progressbar").max=a,$("#totaltime").html(calculateTime(a)),
b=setInterval(function(){var a=player.getCurrentTime();_("progressbar").stepUp(Math.round(a)-_("progressbar").value);$("#playtime").html(calculateTime(a))},1E3)):a.data==YT.PlayerState.ENDED?(clearTimeout(b),$(".play").each(function(){$(this).attr("attr-query")==$("#playing_query").val()&&$(this).attr("id")==$("#playing_track").val()&&($(this).css("background","url(pics/icons/play_v1_grey.png)"),$(this).css("background-size","19px 22px"))}),$("#play").css("background","url(pics/icons/play_grey.png)"),
$("#play").css("background-size","40px 40px"),loop_one&&switchSong($("#playing_track").val()),shuffle&&playlist_pos<playlist.length-1&&$("#next").trigger("click"),loop&&$("#next").trigger("click")):a.data==YT.PlayerState.PAUSED?($(".play").each(function(){$(this).attr("attr-query")==$("#playing_query").val()&&$(this).attr("id")==$("#playing_track").val()&&($(this).css("background","url(pics/icons/play_v1.png)"),$(this).css("background-size","19px 22px"))}),$("#play").css("background","url(pics/icons/play.png)"),
$("#play").css("background-size","40px 40px")):-1==a.data?(clearTimeout(b),$(".play").each(function(){$(this).attr("attr-query")==$("#playing_query").val()&&$(this).attr("id")==$("#playing_track").val()&&($(this).css("background","url(pics/icons/play_v1_grey.png)"),$(this).css("background-size","19px 22px"))}),$("#play").css("background","url(pics/icons/play_grey.png)"),$("#play").css("background-size","40px 40px")):clearTimeout(b)}
function playerSwitch(a,b,c,d,e,h,k){b==c&&d==$("#playing_query").val()?-1==player.getPlayerState()||5==player.getPlayerState()||0==player.getPlayerState()?($("#playing_track").val(c),$("#playing_query").val(d),$("#playing_track_name").val(h),$("#playing_track_artist").val(k),$("#selected_track").val(c),$("#selected_track_thumbnail").val(e),$("#selected_track_name").val(h),$("#selected_track_artist").val(k),$(".play").css("background","url(pics/icons/play_v1_grey.png)"),$(".play").css("background-size",
"19px 22px"),switchSong(c),a&&(a.css("background","url(pics/icons/pause.png)"),a.css("background-size","19px 22px"))):(2==player.getPlayerState()?(playVideo(),a.css("background","url(pics/icons/pause.png)")):(pauseVideo(),a.css("background","url(pics/icons/play_v1.png)")),a.css("background-size","19px 22px")):($.ajax({type:"POST",url:"/listening",cache:!1,data:"queryString="+d+"&videoID="+c+"&thumbnail="+e+"&track="+h+"&artist="+k,success:function(a){$.ajax({type:"POST",url:"/searchYoutube",cache:!1,
data:"query="+d,success:function(a){a=a.split("<joelamltc>");printLyrics(a[2])}})}}),$("#playing_track").val(c),$("#playing_query").val(d),$("#playing_track_name").val(h),$("#playing_track_artist").val(k),$("#selected_track").val(c),$("#selected_track_thumbnail").val(e),$("#selected_track_name").val(h),$("#selected_track_artist").val(k),$(".play").css("background","url(pics/icons/play_v1_grey.png)"),$(".play").css("background-size","19px 22px"),switchSong(c),a&&(a.css("background","url(pics/icons/pause.png)"),
a.css("background-size","19px 22px")))}function printLyrics(a){var b="";lyricsSplit=a.split("\n");for(a=0;a<lyricsSplit.length;a++)b+=lyricsSplit[a]+"<br>";$("div.lyrics").html(b)}
$(document).on("click",".play",function(){var a=$(this).attr("attr-query"),b=$(this).attr("id"),c=$(this).attr("attr-thumbnail"),d,e,h=$(this),k="undefined"===typeof player.getVideoData().video_id?"":player.getVideoData().video_id;0<$("#resultContainer").find(".record").length?(d=$.trim($(this).closest(".record").find(".song_name").html()),e=$.trim($(this).closest(".record").find(".song_artist a").html())):0<$("#artistResultContainer").find(".record").length&&(d=$.trim($(this).closest(".record").find(".trackName").html()),
e=$.trim($("#artistName").html()));b?playerSwitch(h,k,b,a,c,d,e):$.ajax({type:"POST",url:"/searchYoutube",cache:!1,data:"query="+a,success:function(b){b=b.split("<joelamltc>");var c=b[0],f=b[1];h.attr("attr-thumbnail",f);h.attr("id",c);playerSwitch(h,k,c,a,f,d,e);printLyrics(b[2])}});if(search){var f;playlist=[];originPlaylist=[];0<$("#resultContainer").find(".record").length?f=$(this).closest("#resultContainer").find(".record"):0<$("#artistResultContainer").find(".record").length&&(f=$(this).closest("#artistResultContainer").find(".record"));
var l=0;f.each(function(){var a=$(this).find(".button_play button"),b=a.attr("id"),c=a.attr("attr-query"),d,e;0<$("#resultContainer").find(".record").length?(d=$.trim($(this).find(".song_name").html()),e=$.trim($(this).find(".song_artist a").html())):0<$("#artistResultContainer").find(".record").length&&(d=$.trim($(this).find(".trackName").html()),e=$.trim($("#artistName").html()));if(b){var a=a.attr("attr-thumbnail"),f={};f.trackid=b;f.thumbnail=a}else f={};f.query=c;f.name=d;f.artist=e;playlist[l++]=
f});shuffle&&(originPlaylist=playlist.slice(),playlist=shuffleArray(playlist));for(b=0;b<playlist.length;b++)if(playlist[b].query==a){playlist_pos=b;break}0<playlist_pos?$("#prev").attr("attr-prev",JSON.stringify(playlist[playlist_pos-1])):loop?$("#prev").attr("attr-prev",JSON.stringify(playlist[playlist.length-1])):$("#prev").attr("attr-prev","");playlist_pos<playlist.length-1?$("#next").attr("attr-next",JSON.stringify(playlist[playlist_pos+1])):loop?$("#next").attr("attr-next",JSON.stringify(playlist[0])):
$("#next").attr("attr-next","");search=!1}else 0<playlist_pos?$("#prev").attr("attr-prev",JSON.stringify(playlist[playlist_pos-1])):loop?$("#prev").attr("attr-prev",JSON.stringify(playlist[playlist.length-1])):$("#prev").attr("attr-prev",""),playlist_pos<playlist.length-1?$("#next").attr("attr-next",JSON.stringify(playlist[playlist_pos+1])):loop?$("#next").attr("attr-next",JSON.stringify(playlist[0])):$("#next").attr("attr-next","")});
$("#next").click(function(){var a=JSON.parse($(this).attr("attr-next")),b="undefined"===typeof player.getVideoData().video_id?"":player.getVideoData().video_id,c="";if(a.trackid){var d=a.query;$.ajax({type:"POST",url:"/searchYoutube",cache:!1,data:"query="+d,success:function(e){e=e.split("<joelamltc>");var h=a.trackid,k=a.thumbnail,f,l;0<$("#resultContainer").find(".record").length?l=$("#resultContainer").find("button.play"):0<$("#artistResultContainer").find(".record").length&&(l=$("#artistResultContainer").find("button.play"));
for(var g=0;g<playlist.length;g++)if(playlist[g].query==d){playlist_pos=g;c=playlist[g].query;break}l.each(function(){if($(this).attr("attr-query")==c)return f=$(this),!1});playerSwitch(f,b,h,d,k,a.name,a.artist);printLyrics(e[2]);$("#prev").attr("attr-prev",JSON.stringify(playlist[playlist_pos-1]));playlist_pos<playlist.length-1?$("#next").attr("attr-next",JSON.stringify(playlist[playlist_pos+1])):loop?$("#next").attr("attr-next",JSON.stringify(playlist[0])):$("#next").attr("attr-next","")}})}else d=
a.query,$.ajax({type:"POST",url:"/searchYoutube",cache:!1,data:"query="+d,success:function(e){e=e.split("<joelamltc>");var h=e[0],k=e[1],f,l;0<$("#resultContainer").find(".record").length?l=$("#resultContainer").find("button.play"):0<$("#artistResultContainer").find(".record").length&&(l=$("#artistResultContainer").find("button.play"));for(var g=0;g<playlist.length;g++)if(playlist[g].query==d){playlist_pos=g;c=playlist[g].query;break}l.each(function(){if($(this).attr("attr-query")==c)return f=$(this),
!1});f&&(f.attr("attr-thumbnail",k),f.attr("id",h));playerSwitch(f,b,h,d,k,a.name,a.artist);printLyrics(e[2]);$("#prev").attr("attr-prev",JSON.stringify(playlist[playlist_pos-1]));playlist_pos<playlist.length-1?$("#next").attr("attr-next",JSON.stringify(playlist[playlist_pos+1])):loop?$("#next").attr("attr-next",JSON.stringify(playlist[0])):$("#next").attr("attr-next","")}})});
$("#prev").click(function(){var a=JSON.parse($(this).attr("attr-prev")),b="undefined"===typeof player.getVideoData().video_id?"":player.getVideoData().video_id,c="";if(a.trackid){var d=a.query;$.ajax({type:"POST",url:"/searchYoutube",cache:!1,data:"query="+d,success:function(e){e=e.split("<joelamltc>");var h=a.trackid,k=a.thumbnail,f,l;0<$("#resultContainer").find(".record").length?l=$("#resultContainer").find("button.play"):0<$("#artistResultContainer").find(".record").length&&(l=$("#artistResultContainer").find("button.play"));
for(var g=0;g<playlist.length;g++)if(playlist[g].query==d){playlist_pos=g;c=playlist[g].query;break}l.each(function(){if($(this).attr("attr-query")==c)return f=$(this),!1});playerSwitch(f,b,h,d,k,a.name,a.artist);printLyrics(e[2]);0<playlist_pos?$("#prev").attr("attr-prev",JSON.stringify(playlist[playlist_pos-1])):loop?$("#prev").attr("attr-prev",JSON.stringify(playlist[playlist.length-1])):$("#prev").attr("attr-prev","");$("#next").attr("attr-next",JSON.stringify(playlist[playlist_pos+1]))}})}else d=
a.query,$.ajax({type:"POST",url:"/searchYoutube",cache:!1,data:"query="+d,success:function(e){e=e.split("<joelamltc>");var h=e[0],k=e[1],f,l;0<$("#resultContainer").find(".record").length?l=$("#resultContainer").find("button.play"):0<$("#artistResultContainer").find(".record").length&&(l=$("#artistResultContainer").find("button.play"));for(var g=0;g<playlist.length;g++)if(playlist[g].query==d){playlist_pos=g;c=playlist[g].query;break}l.each(function(){if($(this).attr("attr-query")==c)return f=$(this),
!1});f&&(f.attr("attr-thumbnail",k),f.attr("id",h));playerSwitch(f,b,h,d,k,a.name,a.artist);printLyrics(e[2]);0<playlist_pos?$("#prev").attr("attr-prev",JSON.stringify(playlist[playlist_pos-1])):loop?$("#prev").attr("attr-prev",JSON.stringify(playlist[playlist.length-1])):$("#prev").attr("attr-prev","");$("#next").attr("attr-next",JSON.stringify(playlist[playlist_pos+1]))}})});function mouseupProgressbar(a){player.seekTo(a.value,!0)}
function mousemoveProgressbar(a){player.seekTo(a.value,!1);mouseupProgressbar(a)}
$("#hide").click(function(){var a=$(window).height()-75-60;$("#player").is(":visible")?($("#player").fadeOut(function(){$(".lyrics").animate({height:a+"px"})}),$(this).css("background","url(/pics/icons/mini.png)"),$(this).css("background-size","20px 20px")):($(".lyrics").animate({height:a-285+"px"},function(){$("#player").fadeIn()}),$(this).css("background","url(/pics/icons/mini_grey.png)"),$(this).css("background-size","20px 20px"),$(this).removeAttr("style"))});
$("#mute").click(function(){var a=$("#volume").val();0<a?($(this).attr("src","/pics/icons/mute.png"),$(this).attr("data-vol",a),player.mute(),$("#volume").val(0)):($(this).attr("src","/pics/icons/sound.png"),player.unMute(),$("#volume").val($(this).attr("data-vol")),player.setVolume($(this).attr("data-vol")))});
$("#shuffle").click(function(){shuffle?(shuffle=!1,$(this).css("background","url(/pics/icons/random_grey.png)"),$(this).css("background-size","25px 25px"),$(this).removeAttr("style"),playlist=originPlaylist.slice()):(shuffle=!0,$(this).css("background","url(/pics/icons/random.png)"),$(this).css("background-size","25px 25px"),originPlaylist=playlist.slice(),playlist=shuffleArray(playlist))});
$("#loop").click(function(){loop?(loop=!1,$(this).css("background","url(/pics/icons/repeat_grey.png)"),$(this).css("background-size","30px 30px"),$(this).removeAttr("style")):(loop=!0,$(this).css("background","url(/pics/icons/repeat.png)"),$(this).css("background-size","30px 30px"));loop_one=!1;$("#loop_one").css("background","url(/pics/icons/loop_one_grey.png)");$("#loop_one").css("background-size","30px 30px");$("#loop_one").removeAttr("style")});
$("#loop_one").click(function(){loop_one?(loop_one=!1,$(this).css("background","url(/pics/icons/loop_one_grey.png)"),$(this).css("background-size","30px 30px"),$(this).removeAttr("style")):(loop_one=!0,$(this).css("background","url(/pics/icons/loop_one.png)"),$(this).css("background-size","30px 30px"));loop=!1;$("#loop").css("background","url(/pics/icons/repeat_grey.png)");$("#loop").css("background-size","30px 30px");$("#loop").removeAttr("style")});
$("#play").click(function(){2==player.getPlayerState()||-1==player.getPlayerState()||0==player.getPlayerState()?playVideo():pauseVideo()});$("#volume").bind("mousewheel DOMMouseScroll",function(a){0<a.originalEvent.wheelDelta||0>a.originalEvent.detail?_("volume").stepUp(3):_("volume").stepDown(3);volume(_("volume"))});function playVideo(){player.playVideo()}function pauseVideo(){player.pauseVideo()}function stopVideo(){player.stopVideo()}
function switchSong(a){_("progressbar").value=0;$("#playing_track_info").html($("#selected_track_artist").val()+"<br>"+$("#selected_track_name").val()).hide().fadeIn(1E3);$("#playing_track_thumbnail").attr("src",$("#selected_track_thumbnail").val()).hide().fadeIn(1E3);$("#add_playing_track").fadeIn(1E3);player.loadVideoById(a,0,"small")}
function volume(a){var b=a.value;0==a.value?($("#mute").attr("src","/pics/icons/mute.png"),$("#mute").attr("data-vol",100),player.mute(),player.setVolume(0)):($("#mute").attr("src","/pics/icons/sound.png"),$("#mute").attr("data-vol",b),player.unMute(),player.setVolume(b))}function calculateTime(a){sec=pad(Math.floor(a%60));min=pad(Math.floor(a/60)%60);return min+":"+sec}function pad(a,b){for(var c=String(a);c.length<(b||2);)c="0"+c;return c}
function shuffleArray(a){for(var b=a.length,c,d;0<b;)d=Math.floor(Math.random()*b),b--,c=a[b],a[b]=a[d],a[d]=c;return a}
$(document).ready(function(){$(".form-control").focus();$("#playing_track_thumbnail").hide();$("#playing_track_info").hide();$("#add_playing_track").hide();$body=$("body");$(document).on({ajaxStart:function(a){"key_words"!=a.target.activeElement.id&&$body.addClass("loading")},ajaxStop:function(a){"key_words"!=a.target.activeElement.id&&$body.removeClass("loading")}});$("#key_words").autocomplete({source:function(a,b){$.getJSON("http://suggestqueries.google.com/complete/search?callback=?",{hl:"en",
ds:"yt",jsonp:"suggestCallBack",q:a.term,client:"youtube"});suggestCallBack=function(a){var d=[];$.each(a[1],function(a,b){d.push({value:b[0]})});d.length=10;b(d)}}});$(document).on("click",".ui-menu-item",function(){$("#searchField").trigger("submit")});$("#searchField").submit(function(a){a.preventDefault();a=$(this).find('input[name="key_words"]').val();$(".ui-autocomplete").css("display","none");$(".playlist_content").each(function(){$(this).removeClass("selected_playlist");$(this).find(".playlist_icon img").attr("src",
"/pics/icons/music_grey.png")});$(".suggestlist").removeClass("selected_playlist");$(".suggestlist").find(".playlist_icon img").attr("src","/pics/icons/music_grey.png");$.ajax({type:"POST",url:"/result",cache:!1,data:"key_words="+a,success:function(a){$("#content").html(a).hide();$("#content").fadeIn(1E3);search=!0},beforeSend:function(){$body.addClass("loading")},complete:function(){$body.removeClass("loading")}})});$(document).on("click",".song_artist a",function(a){a.preventDefault();a=$(this).attr("attr-artist-name");
$.ajax({type:"POST",url:"/artist",cache:!1,data:"artist_name="+a,success:function(a){a=a.split("<CCYK>");$("#content").html(a[1]).hide();$("#artistTitle").css("background-image","url("+a[0]+")");$("#content").fadeIn(1E3);search=!0}})});$("#add_playlist").mouseover(function(){$(this).css("color","#1DD760");$(this).find("img").attr("src","/pics/icons/plus_circle.png")}).mouseout(function(){$(this).css("color","#FFFAFA");$(this).find("img").attr("src","/pics/icons/plus_circle_grey.png")});$(document).on("mouseover",
".playlist_content, .suggestlist",function(){$(this).find(".playlist_icon > img").attr("src","/pics/icons/music.png")}).on("mouseout",".playlist_content, .suggestlist",function(){$(this).hasClass("selected_playlist")?$(this).find(".playlist_icon > img").attr("src","/pics/icons/music.png"):$(this).find(".playlist_icon > img").attr("src","/pics/icons/music_grey.png")});$(".suggestlist").click(function(a){a.preventDefault();$(".playlist_content").each(function(){$(this).removeClass("selected_playlist");
$(this).find(".playlist_icon img").attr("src","/pics/icons/music_grey.png")});$(this).addClass("selected_playlist");$(this).find(".playlist_icon img").attr("src","/pics/icons/music.png");$.ajax({type:"POST",url:"/playlist",cache:!1,data:"action=displaySuggestlistDetail",success:function(a){$("#content").html(a).hide();$("#content").fadeIn(1E3);search=!0}})});$("#add_playlist").click(function(){var a=$(this).offset();$("#select_playlist").focusout();$("#new_playlist_name").is(":visible")?$("#new_playlist_name").fadeOut():
$("#new_playlist_name").css("left",a.left+201+"px").fadeIn(function(){$("#playlist_name_field").focus()})});$("#submit_playlist_name").click(function(){var a=$("#playlist_name_field").val();""!=a&&$.ajax({type:"POST",url:"/playlist",cache:!1,data:"action=addPlaylist&data="+a,success:function(a){a=a.split("<joelamltc>");var c=$("#playlist_container div:last").parent().attr("class"),d=$("#select_playlist div.select_playlist_container:last");"playlist_content"==c?$("#playlist_container div.playlist_content:last").after(a[0]):
$("#playlist_container div.suggestlist:last").after(a[0]);"select_playlist_content"==d.attr("class")?$("#select_playlist div.select_playlist_content:last").after(a[1]):$("#select_playlist div.select_playlist_container").append(a[1]);$("#playlist_container").scrollTop($("#playlist_container").height());$("#playlist_container div.playlist_content:last").hide().fadeIn(1E3);$("#select_playlist div.select_playlist_content:last").hide().fadeIn(1E3);$("#playlist_name_field").val("");$("#new_playlist_name").fadeOut()}})});
$(document).on("click",".playlist_content",function(a){a.preventDefault();a=$(this).find(".playlist_name").attr("attr-playlist-id");var b=$(this).find(".playlist_name a").html();$(".playlist_content").each(function(){$(this).removeClass("selected_playlist");$(this).find(".playlist_icon img").attr("src","/pics/icons/music_grey.png")});$(".suggestlist").removeClass("selected_playlist");$(".suggestlist").find(".playlist_icon img").attr("src","/pics/icons/music_grey.png");$(this).addClass("selected_playlist");
$(this).find(".playlist_icon img").attr("src","/pics/icons/music.png");$.ajax({type:"POST",url:"/playlist",cache:!1,data:"action=displayPlaylistDetail&data="+a+"&name="+b,success:function(a){$("#content").html(a).hide();$("#content").fadeIn(1E3);search=!0}})});$(document).on("click","#delete_playlist",function(){var a=$.trim($(this).closest("#title").text());confirm('Are you sure to delete the PLAYLIST "'+a+'"?')&&(a=$(this).attr("attr-id"),$.ajax({type:"POST",url:"/playlist",cache:!1,data:"action=deletePlaylist&data="+
a,success:function(a){$("#content").children().fadeOut(1E3,function(){$("#content").empty()});$("div[attr-playlist-id="+a+"]").closest(".playlist_content").fadeOut(1E3,function(){$(this).remove()})}}))});$("#select_playlist").focusout(function(){setTimeout(function(){var a=$(document.activeElement);a.is("#select_playlist")||$("#select_playlist").has(a).length||$("#select_playlist").fadeOut(500)},0)});$(document).on("click",".add",function(a){if("add_playing_track"==a.target.id)$("#selected_track").val($("#playing_track").val()),
$("#selected_track_thumbnail").val($("#playing_track_thumbnail").attr("src")),$("#selected_track_name").val($("#playing_track_name").val()),$("#selected_track_artist").val($("#playing_track_artist").val());else{var b=$(this).closest(".record").find(".button_play button");if("undefined"===typeof b.attr("id"))a=b.attr("attr-query"),$.ajax({type:"POST",url:"/searchYoutube",cache:!1,data:"query="+a,success:function(a){var c=a.split("<joelamltc>");a=c[0];c=c[1];b.attr("id",a);b.attr("attr-thumbnail",c);
$("#selected_track").val(a);$("#selected_track_thumbnail").val(c);(c=$.trim($("#"+a).closest(".record").find(".song_name").html()))?($("#selected_track_name").val(c),$("#selected_track_artist").val($.trim($("#"+a).closest(".record").find(".song_artist a").html()))):($("#selected_track_name").val($.trim($("#"+a).closest(".record").find(".trackName").html())),$("#selected_track_artist").val($.trim($("#artistName").html())))}});else{a=b.attr("id");var c=b.attr("attr-thumbnail");$("#selected_track").val(a);
$("#selected_track_thumbnail").val(c);(c=$.trim($("#"+a).closest(".record").find(".song_name").html()))?($("#selected_track_name").val(c),$("#selected_track_artist").val($.trim($("#"+a).closest(".record").find(".song_artist a").html()))):($("#selected_track_name").val($.trim($("#"+a).closest(".record").find(".trackName").html())),$("#selected_track_artist").val($.trim($("#artistName").html())))}}a=$(this).offset();c=$(window).height()-60;$("#select_playlist").is(":visible")?$("#select_playlist").fadeOut(500):
a.top<c-200?$("#select_playlist").css({left:a.left+$(this).width()+13,top:a.top+$(this).height(),outline:0}).attr("tabindex",-1).fadeIn(500).focus():$("#select_playlist").css({left:a.left+$(this).width()+13,top:c-200,outline:0}).fadeIn(500).focus()});$(document).on("click",".select_playlist",function(a){a.preventDefault();a=$(this).attr("attr-playlist-id");var b=$("#selected_track").val(),c=$("#selected_track_name").val(),d=$("#selected_track_artist").val(),e=$("#selected_track_thumbnail").val();
console.log(a+" "+b+" "+c+" "+d+" "+e);a&&b&&c&&d&&e&&$.ajax({type:"POST",url:"/playlist",cache:!1,data:"action=addTrackToPlaylist&data="+a+"&video_id="+b+"&track_name="+c+"&track_artist="+d+"&thumbnail="+e,success:function(a){var b,c=0,d=a.split("<joelamltc>");a=$("#playlist_token").val();$("#select_playlist").fadeOut(500);b=setInterval(function(){10==c?(clearTimeout(b),$("div.playlist_name[attr-playlist-id="+d[0]+"]").parent().removeAttr("style")):(0==c%2?$("div.playlist_name[attr-playlist-id="+
d[0]+"]").parent().css("background","#171717"):$("div.playlist_name[attr-playlist-id="+d[0]+"]").parent().css("background","#272727"),c++)},100);a==d[0]&&(0==$("#resultContainer div.record:last").length?$("#resultContainer").html(d[1]):$("#resultContainer div.record:last").after(d[1]),$("#resultContainer div.record:last").hide().fadeIn(1E3))}})});$(document).on("click",".delete",function(){var a=$.trim($(this).closest(".record").find(".song_name").text());if(confirm('Are you sure to delete TRACK "'+
a+'"?')){var a=$(this).attr("attr-id"),b=$("#delete_playlist").attr("attr-id"),c=$(this);$.ajax({type:"POST",url:"/playlist",cache:!1,data:"action=deleteTrack&data="+a+"&playlist="+b,success:function(a){c.parent().parent().fadeOut(1E3,function(){$(this).remove()})}})}})});