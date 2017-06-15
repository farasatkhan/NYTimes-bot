var request = require('request');
var twit = require('twit');
require('dotenv').config();

// Configuration of Twitter
var T = new twit({
	consumer_key:         process.env.CONSUMER_KEY,
  	consumer_secret:      process.env.CONSUMER_SECRET,
  	access_token:         process.env.ACCESS_TOKEN,
  	access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
});

// List for follow users
var user_ID = [];
var user_screenName = [];
var totalResults = 0;

// Categories in NYTimes
var category = [	'home','opinion','world','national','politics','upshot','nyregion','business','technology',
					'science','health','sports','arts','books','movies','theater','sundayreview','fashion','tmagazine',
					'food','travel','magazine','realestate','automobiles','obituaries','insider'];

// List to store the title and url
var item = [];
var politics = [];
var world = [];
var national = [];
var nyregion = [];
var business = [];
var technology = [];
var science = [];
var health = [];
var sports = [];
var fashion = [];
var magazine = [];

// Calling NyTimesApi
function nyTimes(cate){
	var api ="https://api.nytimes.com/svc/topstories/v2/"+cate+".json?api-key=" + process.env.NY_APIKEY;
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

				switch(cate){
					case 'world':
						world.push([title,url]);
						break;
					case 'politics':
						politics.push([title, url]);
						break;
					case 'nyregion':
						nyregion.push([title, url]);
						break;
					case 'technology':
						technology.push([title, url]);
						break;
					case 'business':
						business.push([title,url]);
						break;
					case 'science':
						science.push([title, url]);
						break;
					case 'health':
						health.push([title, url]);
						break;
					case 'fashion':
						fashion.push([title, url]);
						break;
					case 'magazine':
						magazine.push([title, url]);
						break;
					case 'national':
						national.push([title,url]);
						break;
					case 'sports':
						sports.push([title, url]);
						break;

				}
			}
			console.log("Bootup!");
			console.log(item.length);

			if(err){
				item = [];
				var z = 0;

				var x = setInterval(function(){
					if(z == (category.length - 1)){

						setTimeout(function(){
							Streaming();
						},5000);

						clearInterval(x);
					}
					nyTimes(category[z]);
					z++;
				},1500);
			}
		}
	}
}



// Running for the first time --making request to NyTimesApi every 1.5 second because only 5 calls per seconds are allowed.

var z = 0;

var x = setInterval(function(){
	if(z == (category.length - 1)){

		setTimeout(function(){
			Streaming();
		},5000);

		clearInterval(x);
	}
	nyTimes(category[z]);
	z++;
},1500);

// Running every 3 hours and 55 min - Getting new data
setInterval(function(){
	var z = 0;

	var x = setInterval(function(){
		if(z == (category.length - 1)){

			setTimeout(function(){
				Streaming();
			},5000);

			clearInterval(x);
		}
		nyTimes(category[z]);
		z++;
	},1500);
},1000*60*55*3);


// Getting direct messages
function Streaming(){
	var stream = T.stream('user');
	console.log("Streaming started");

	stream.on('direct_message', function(event){	

		var msg = event.direct_message.text;
	 	var screenName = event.direct_message.sender.screen_name;
	 	var userID = event.direct_message.sender.id_str;
	 	var msgID = event.direct_message.id_str;

	 	var msg = msg.toLowerCase();
	 	var random = Math.floor(Math.random() * totalResults)

	 	// Getting a random title and url from the item list
	 	var txt = item[random][0]+ " "+ item[random][1];
	 	var hello = "Hi @"+screenName +", Welcome to our services. These are the option which are available to you. \n \n \
	 			Reply us with one of the following statement.\n \
	 			Read - if you want to read news \n \
	 			World news- to get news about the world \n \
	 			Politics news- to get news about politics \n \
	 			Tech news- to read about the tech \n \
	 			NewYork news- to read news about newyork\n \
	 			Business news- to get latest update about the business world \n \
	 			Read Magazine- to read a magazine \n \
	 			Science news- to read news about Science \n \
	 			Sports news- to get latest update sports\n \
	 			fashion news- to stay uptodate with the fashion world\n \
	 			National news- to read national news\n \
	 			health news- to get update about health news";

	 	// When someone say Hello or Hi --Give instructions to the user
	 	if(msg == 'hello' || msg == 'hi'){
	 		var params = {
	 			user_id: userID,
	 			screen_name: screenName,
	 			text: hello,
	 		}
			T.post('direct_messages/new',params, function(err, data, response){
				if(!err){
					console.log("Sent "+ screenName);
					console.log(item.length);
				}
			}) 		
	 	}

	 	// When someone say read --Sent one random article to the user
		if(msg == 'read' || msg == 'news' || msg == 'topstories' || msg == 'top story' || msg == 'top stories'){
			var params = {
				user_id: userID,
				screen_name: screenName,
				text: txt,
			}
			T.post('direct_messages/new',params, function(err, data, response){
				if(!err){
					console.log("Sent "+ screenName);
					console.log(item.length);
				}
			})
		}
		// when user say one of the given below then sent related news
		if(msg == 'world news' || msg == 'world'){
			var txt = world[random][0]+ " "+ world[random][1];
			Post(txt);
		}
		if(msg == 'politics news' || msg == 'politics'){
			var txt = politics[random][0]+ " "+ politics[random][1];
			Post(txt);	
		}
		if(msg == 'tech news' || msg == 'tech' || msg== 'technology'){
			var txt = technology[random][0]+ " "+ technology[random][1];
			Post(txt);
		}
		if(msg == 'NewYork news' || msg == 'nyregion news' || msg == 'NewYork' || msg== 'nyregion'){
			var txt = nyregion[random][0]+ " "+ nyregion[random][1];
			Post(txt);
		}
		if(msg == 'business news' || msg == 'business'){
			var txt = business[random][0]+ " "+ business[random][1];
			Post(txt);
		}
		if(msg == 'read magazine' || msg == 'magazine'){
			var txt = magazine[random][0]+ " "+ magazine[random][1];
			Post(txt);
		}
		if(msg == 'science news' || msg == 'science'){
			var txt = science[random][0]+ " "+ science[random][1];
			Post(txt);
		}
		if(msg == 'fashion news' || msg == 'fashion'){
			var txt = fashion[random][0]+ " "+ fashion[random][1];
			Post(txt);
		}
		if(msg == 'sports news' || msg == 'sport news' || msg == 'sports' || msg == 'sport'){
			var txt = sports[random][0]+ " "+ sports[random][1];
			Post(txt);
		}
		if(msg == 'national news' || msg == 'national'){
			var txt = national[random][0]+ " "+ national[random][1];
			Post(txt);
		}
		if(msg == 'health news' || msg == 'health'){
			var txt = health[random][0]+ " "+ health[random][1];
			Post(txt);
		}


		// When someone say follow --add to the list
		if(msg == 'follow'){

			if(user_ID.indexOf(userID) == -1 && user_screenName.indexOf(screenName) == -1){

				user_ID.push(userID);
				user_screenName.push(screenName);

				Post("Thanks for following us. You will receive articles from us everyday.");
			}else if(user_ID.indexOf(userID) > -1 && user_screenName.indexOf(screenName) > -1){

				Post("You are already following us.");
			}

		}
		// When someone say unfollow --remove from the list
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
					console.log("Posted");
				}
			})	
		}
	})
}


// For our follow users -- senting news
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