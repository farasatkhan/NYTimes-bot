var request = require('request');
var twit = require('twit');
require('dotenv').config();
var serviceAccount = require('./followers.js');
var admin = require("firebase-admin");


// Double streaming after second call from app

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
var maxResult = 0;

// Categories in NYTimes
var category = [	'home','opinion','world','national','politics','upshot','nyregion','business','technology',
					'science','health','sports','arts','books','movies','theater','sundayreview','fashion','tmagazine',
					'food','travel','magazine','realestate','automobiles','obituaries','insider'];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

var db = admin.database();
var ref = db.ref("follow");


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
var error = [];

// Calling NyTimesApi
function nyTimes(cate){
	var api ="https://api.nytimes.com/svc/topstories/v2/"+cate+".json?api-key=" + process.env.NY_APIKEY;
	
	request.get(api, response);

	function response(err, response, body) {
		try{

			body = JSON.parse(body);
			status_verify = body.status;
			copyright = body.copyright;
			totalResults = body.num_results;
			maxResult += totalResults;

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
			}
		}catch(e){
			console.log("Error at:"+ cate);	
			error.push(cate);
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
	item = [];
	politics = [];
	world = [];
	national = [];
	nyregion = [];
	business = [];
	technology = [];
	science = [];
	health = [];
	sports = [];
	fashion = [];
	magazine = [];
	error = [];

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
},1000*60*3);


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
	 	var random = Math.floor(Math.random() * maxResult);

	 	// Getting a random title and url from the item list
	 	var txt = item[random][0]+ " "+ item[random][1];
	 	var hello = "Hi @"+screenName +", Welcome to our services. These are the option which are available to you. \n \n \
	 			Reply us with one of the following statement.\n \
	 			Read -if you want to read news. \n \
	 			World news -to get news about the world. \n \
	 			Politics news -to get news about politics. \n \
	 			Tech news -to read about the tech .\n \
	 			New York news -to read news about newyork.\n \
	 			Business news -to get news about business.\n \
	 			Read Magazine -to read a magazine. \n \
	 			Science news -to read news about Science. \n \
	 			Sports news -to get latest update sports.\n \
	 			Fashion news -to get news about fashion.\n \
	 			National news -to read national news.\n \
	 			Health news -to get update about health news.\n \
	 			----------------------------------------\n\
	 			Follow -to get news everyday. \n \
	 			Unfollow -to stop getting updates from us.";

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
				}else{
					console.log("Error at hello: "+ err);
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
		if(msg == 'world news' || msg == 'world' && error.indexOf('world') > -1){
			var rand = Math.floor(Math.random() * world.length);
			var txt = world[rand][0]+ " "+ world[rand][1];
			Post(txt);
		}
		if(msg == 'politics news' || msg == 'politics' && error.indexOf('politics') > -1){
			var rand = Math.floor(Math.random() * politics.length);
			var txt = politics[rand][0]+ " "+ politics[rand][1];
			Post(txt);	
		}
		if(msg == 'tech news' || msg == 'tech' || msg== 'technology' && error.indexOf('technology') > -1){
			var rand = Math.floor(Math.random() * technology.length);
			var txt = technology[rand][0]+ " "+ technology[rand][1];
			Post(txt);
		}
		if(msg == 'new york news' || msg == 'nyregion news' || msg == 'new york' || msg== 'nyregion' && error.indexOf('nyregion') > -1){
			var rand = Math.floor(Math.random() * nyregion.length);
			var txt = nyregion[rand][0]+ " "+ nyregion[rand][1];
			Post(txt);
		}
		if(msg == 'business news' || msg == 'business' && error.indexOf('business') > -1){
			var rand = Math.floor(Math.random() * business.length);
			var txt = business[rand][0]+ " "+ business[rand][1];
			Post(txt);
		}
		if(msg == 'read magazine' || msg == 'magazine' && error.indexOf('magazine') > -1){
			var rand = Math.floor(Math.random() * magazine.length);
			var txt = magazine[rand][0]+ " "+ magazine[rand][1];
			Post(txt);
		}
		if(msg == 'science news' || msg == 'science' && error.indexOf('science') > -1){
			var rand = Math.floor(Math.random() * science.length);
			var txt = science[rand][0]+ " "+ science[rand][1];
			Post(txt);
		}
		if(msg == 'fashion news' || msg == 'fashion' && error.indexOf('fashion') > -1){
			var rand = Math.floor(Math.random() * fashion.length);
			var txt = fashion[rand][0]+ " "+ fashion[rand][1];
			Post(txt);
		}
		if(msg == 'sports news' || msg == 'sport news' || msg == 'sports' || msg == 'sport' && error.indexOf('sports') > -1){
			var rand = Math.floor(Math.random() * sports.length);
			var txt = sports[rand][0]+ " "+ sports[rand][1];
			Post(txt);
		}
		if(msg == 'national news' || msg == 'national' && error.indexOf('national') > -1){
			var rand = Math.floor(Math.random() * national.length);
			var txt = national[rand][0]+ " "+ national[rand][1];
			Post(txt);
		}
		if(msg == 'health news' || msg == 'health' && error.indexOf('health') > -1){
			var rand = Math.floor(Math.random() * health.length);
			var txt = health[rand][0]+ " "+ health[rand][1];
			Post(txt);
		}


		// When someone say follow --add to the list
		if(msg == 'follow'){
				ref.orderByChild("name").equalTo("farasatkahan").once("value", function(snapshot) {
				    var userData = snapshot.val();
				    var screenName = event.direct_message.sender.screen_name;
	 				var userID = event.direct_message.sender.id_str;

				    if (!userData){
				      	var data = {
				      		name: screenName,
					  		user_id: userID
						}

						if(ref.push(data)){
						Post("Thanks for following us. You will receive articles from us everyday.");
						}
				    }else{
				    	Post("You are already following us or there might be a problem.");
				    }
				});
		}
		// When someone say unfollow --remove from the list
		if(msg == 'unfollow'){
			var screenName = event.direct_message.sender.screen_name;
	 		var userID = event.direct_message.sender.id_str;

			ref.orderByChild("user_id").equalTo(userID).once("value", function(snapshot) {
			    var userData = snapshot.val();
			    var key = snapshot.key;

		    
			    if (userData){

			      var k = Object.keys(userData);
			      ref.child(k[0]).remove();

			      Post("Sorry for inconvenience, You are unfollowed from our services.");

			    }else{
			      Post("You are not following us. To follow, reply with 'follow' ");	
			    }
			});

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
	var rand = Math.floor(Math.random() * maxResult)
	var val = item[rand][0] + " " +item[rand][1];

	var saveData = [];

	ref.on("value", gotData, errData);

	function gotData(data){
	  // console.log(data.val());
	  var data = data.val();
	  var keys = Object.keys(data);
	  // console.log(keys);

	  for(var i=0;i<keys.length; i++){
	    var k= keys[i];
	    var name = data[k].name;
	    var user_id = data[k].user_id;

	    saveData.push([user_id, name]);
	  }}


	function errData(err){
	  console.log("Error");
	  console.log(err);}

	for(var i =0; i< saveData.length; i++){
		var params = {
			user_id: saveData[i][0],
			screen_name: saveData[i][1],
			text: val,
		}
		T.post('direct_messages/new',params, function(err, data, response){
			if(!err){
				console.log("Follow User Sent: "+ screenName);
			}
		})

		wait(1000 * 12);
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
},1000*60*60*21);