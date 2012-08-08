/*
 * This is the function that actually highlights a text string by adding HTML tags before and after all occurrences of the search term.
 */
function doHighlight(bodyText, i, searchTerm) {

	highlightStartTag = "<span style='color:blue; background-color:yellow;' class='loadPopup' data_id='"+i+"'><span class='loadPopupVideo' data_id='"+i+"'>";
	highlightEndTag = "</span></span>";

	var newText = "";
	var i = -1;
	var lcSearchTerm = searchTerm.prefLabel.toLowerCase();
	var lcBodyText = bodyText.toLowerCase();

	while (bodyText.length > 0) {
		i = lcBodyText.indexOf(lcSearchTerm, i+1);
		if (i < 0) {
			newText += bodyText;
			bodyText = "";
		} else {
			// skip anything inside an HTML tag
			if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
				// skip anything inside a <script> block
				if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i)) {
					newText += bodyText.substring(0, i) + highlightStartTag + bodyText.substr(i, searchTerm.prefLabel.length) + highlightEndTag;
					bodyText = bodyText.substr(i + searchTerm.prefLabel.length);
					lcBodyText = bodyText.toLowerCase();
					i = -1;
				}
			}
		}
	}
	return newText;
}

/*
 * This is sort of a wrapper function to the doHighlight function.
 * It takes the searchArray that you pass and transforms the text on the current web page.
 */
function highlight(searchArray) {
	var bodyText= document.body.innerHTML;
	$.each(searchArray, function(i,el){
		bodyText = doHighlight(bodyText, i, el);
	});
	document.body.innerHTML= bodyText;
}

/*
 * This retrieve the database from url
 */
function retriveList(url){
	var xhr = new XMLHttpRequest();
	xhr.onload = function(){
		var myList= xhr.responseText;
		highlight(JSON.parse(myList));
		load_artist_tooltips(JSON.parse(myList));
		load_artist_video(JSON.parse(myList));
	};
	xhr.open('GET',url,true);
	xhr.send(null);
}

function load_artist_tooltips(myList){
	$(".loadPopup").each(function(){
		var item= myList[parseInt($(this).attr("data_id"))];
		var popup_content= "<span style='color:white;'>"+item.description.value+"</span>";
		if(item.thumbnail){
			popup_content= "<img src='"+item.thumbnail.uri+"' style='float:left; margin-right: 8px; ' />"+popup_content;
		}
		$(this).qtip({
			content:{
				text: popup_content
			},
			show:{
				solo:false
			},
			style:{
				classes:"ui-tooltip-youtube"
			},
			position:{
				my:"top left",
				at:"bottom right"
			},
			hide:{
				event:"click mouseleave"
			}
		})
	})
}

function load_artist_video(myList){
	var videos= new Array();
	$(".loadPopupVideo").each(function(){
		var item= myList[parseInt($(this).attr("data_id"))];
		var artist= escape(item.prefLabel);
		//Check if artist video has already been requested
		if(!(artist in videos)){
			videos[artist]= SearchYouTube(artist);
		}
		$(this).qtip({
			content:{
				text: videos[artist]
			},
			show:{
				solo:false
			},
			style:{
				classes:"ui-tooltip-youtube"
			},
			position:{
				my:"bottom right",
				at:"top left"
			},
			hide:{
				event:"click mouseleave",
				delay: "1500"
			}
		})
	})
}

function SearchYouTube(query){
	var req = new XMLHttpRequest();
	 var xhReq = new XMLHttpRequest();
	req.open('GET','http://gdata.youtube.com/feeds/videos?alt=json&q='+query,false);
	req.send(null);
	var feed= req.responseText;
	var data= JSON.parse(feed);
	var row = "";
	row += "<div><a href='"+data.feed.entry[0].link[0].href+"' ><img style='width=120:px; height:80px; float:left; margin-right: 8px;' src=" + data.feed.entry[0].media$group.media$thumbnail[0].url + " /></a>";
	row += "<a href='"+data.feed.entry[0].link[0].href+"' style='font-weight:bold; color:steelblue;'>" + data.feed.entry[0].media$group.media$title.$t + "</a></div>";
	row += "<div style='margin-top:7px; font-size:12px; color:white;'>by " + data.feed.entry[0].author[0].name.$t + "</div>";
	row += "<div style='margin-top:5px; font-size:12px; color:white;'>" + data.feed.entry[0].yt$statistics.viewCount + " views" + "</div>";
	return row;
}
