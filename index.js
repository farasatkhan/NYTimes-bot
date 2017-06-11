var request = require('request');
var api = require('./configNY.js');
var twit = require('twit');
var config = require('./config.js');
var T = new twit(config);

//   https://api.nytimes.com/svc/topstories/v2/home.json?api-key=c299f896b5bd4900bd44d00e24d6e5bd

// +add

// Linked with follow
var user_ID = [];
var user_screenName = [];
var totalResults = 0;
var item = [];

function nyTimes(){
	// Get data from newyork times
	request.get(api, response);

	function response(err, response, body) {
		body = JSON.parse(body);
		
		status_verify = body.status;
		copyright = body.copyright;
		totalResults = body.num_results;

		if (status_verify == "OK"){

			for(var i = 0; i < totalResults; i++){
				var title = body.results[i].title;
				var url = body.results[i].short_url;

				item.push([title, url])			
			}
			console.log("BootUp");
			Streaming();
		}
	}
}

nyTimes();
setInterval(function(){nyTimes()}, 1000*60*60*3);


// Looking for direct message streaming
function Streaming(){
	var stream = T.stream('user');
	stream.on('direct_message', function(event){
		var msg = event.direct_message.text;
	 	var screenName = event.direct_message.sender.screen_name;
	 	var userID = event.direct_message.sender.id_str;
	 	var msgID = event.direct_message.id_str;

	 	var msg = msg.toLowerCase();

	 	var random = Math.floor(Math.random() * totalResults)

	 	var txt = item[random][0]+ " "+ item[random][1];
	 	var hello = "Hi @"+screenName +", Welcome to our services. These are the option which are available to you. \n \n \
	 			Reply us with one of the following word:\n \
	 			Read - To Read an article \n \
	 			Follow - To Read articles everyday \n \
	 			UnFollow - To Unfollow from our services"

	 	// When someone say Hello or Hi
	 	if(msg == 'hello' || msg == 'hi'){
	 		var params = {
	 			user_id: userID,
	 			screen_name: screenName,
	 			text: hello,
	 		}
			T.post('direct_messages/new',params, function(err, data, response){
				if(!err){
					console.log("Sent "+ screenName);
					callbackHandler(msgID);
				}
			}) 		
	 	}

	 	// When someone say read
		if(msg == 'read'){
			var params = {
				user_id: userID,
				screen_name: screenName,
				text: txt,
			}
			T.post('direct_messages/new',params, function(err, data, response){
				if(!err){
					console.log("Sent "+ screenName);
					callbackHandler(msgID);
				}
			})
		}

		// When someone say follow
		if(msg == 'follow'){

			if(user_ID.indexOf(userID) == -1 && user_screenName.indexOf(screenName) == -1){

				user_ID.push(userID);
				user_screenName.push(screenName);

				Post("Thanks for following us. You will receive articles from us everyday.");
			}else if(user_ID.indexOf(userID) > -1 && user_screenName.indexOf(screenName) > -1){

				Post("You are already following us.");
			}

		}
		// When someone say unfollow
		if(msg == 'unfollow'){
			var id = user_ID.indexOf(userID);
			var screen = user_screenName.indexOf(screenName);

			if( id > -1 && screen > -1){
				
				user_ID.splice(id);
				user_screenName.splice(screen);

				Post("Sorry for inconvenience, You are unfollowed from our services.");

			}else if(id == -1 && screen == -1){

				Post("You are not following us. To follow, reply with 'follow' ");	
			}

		}
		// Post the statement with direct message
		function Post(txt){
			T.post('direct_messages/new',{user_id: user_ID, screen_name: screenName, text: txt}, function(err, data, response){
				if(!err){
					callbackHandler(msgID);
				}
			})	
		}
	})
}


// Delete the message
function callbackHandler(user_id) {
  T.post('direct_messages/destroy', {
    id: user_id
  }, function (err) {
    if (err) { console.error(err); }
  });
}

// For our follow users
function follow(){
	var rand = Math.floor(Math.random() * totalResults)
	var val = item[rand][0] + " " +item[rand][1];

	for(var i =0; i< user_ID.length; i++){
		var params = {
			user_id: user_ID[i],
			screen_name: user_screenName[i],
			text: val,
		}
		T.post('direct_messages/new',params, function(err, data, response){
			if(!err){
				console.log("Follow User Sent: "+ screenName);
				callbackHandler(msgID);
			}
		})

		wait(1000 * 33)
	}
}


function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

// Looking for new users
function find_User(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	}

	today = yyyy+'-'+mm+'-'+ dd;

	T.get('search/tweets', { q: 'nytimes since:'+ today, count: 15 }, function(err, data, response) {

			var val = [];

		for(var i=0; i < data.statuses.length;i++){
			var id = data.statuses[i].user.id_str;
			var name = data.statuses[i].user.screen_name;

			val.push([id,name])
		}

		for(var k=0; k < val.length; k++){
			// +add random number and some more statements
			txt = "@"+val[k][1]+ ", Want to read more news? DM us."

			T.post('statuses/update', { status: txt}, function(err, data, response) {
		  		console.log(data)
			})

			// sleep for n minutes
			wait(1000 * 60 * 3);
		}
	})
}

setInterval(function(){
	follow();
	find_User();
},1000*60*60*3)