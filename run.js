var Twit = require('twit')
var config = require('./config')

var T = new Twit({
	consumer_key: config.consumerKey,
	consumer_secret: config.consumerSecret,
	access_token: config.accessToken,
	access_token_secret: config.accessTokenSecret
});

var currentTweets = [];

var phrases = ["You want some? I'll give it to ya!", "You've got no ground.", "You want some or what?"];
var endingPhrase = "I think you mean 'a lot'.";
var stream = T.stream('statuses/filter', { track: config.trackingWord });

stream.on('tweet', function (tweet) {
	//Make sure we have user and replyId values in order to reply. Also check that we're not replying to ourselves and that the tweet is not a retweet. 
	if("user" in tweet && "screen_name" in tweet.user && "id_str" in tweet && tweet.user.screen_name != config.username && "text" in tweet && tweet["text"].indexOf(config.trackingWord) > -1 
		&& !("retweeted_status" in tweet))
	{
		currentTweetObj = 	{	"user": tweet.user.screen_name, 
								"replyId" : tweet.id_str
							};

		currentTweets.push(currentTweetObj);
	};
})

setInterval( function() {
	if(Object.keys(currentTweets).length)
	{
		var randTweet = currentTweets[Math.floor(Math.random() * currentTweets.length)];
		var randPhrase = phrases[Math.floor(Math.random() * phrases.length)];

		T.post('statuses/update', { status: '.@' + randTweet.user + ' ' + randPhrase + ' ' + endingPhrase, in_reply_to_status_id: randTweet.replyId }, function(err, data, response) {
			// console.log('posted status to .@' + randTweet.user + ' ' + randPhrase + " with reply id " + randTweet.replyId);
		})

		//reset cache
		currentTweets = [];
	}
}, config.minTweetIntervalSeconds * 1000)