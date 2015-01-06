var Twit = require('twit');
var Gramophone = require('gramophone');
var config = require('./config');

var T = new Twit({
	consumer_key: config.consumerKey,
	consumer_secret: config.consumerSecret,
	access_token: config.accessToken,
	access_token_secret: config.accessTokenSecret
});

var currentTweets = [];

var phrases = ["You want some? I'll give it to ya!", "You've got no ground.", "You want some or what?", "You wanna deal with me?", "You've got not fans!"];
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

var userStream = T.stream('user');

userStream.on('tweet', function(tweet) {
	console.log(tweet);
});

setInterval( function() {
	if(Object.keys(currentTweets).length)
	{
		var randTweet = currentTweets[Math.floor(Math.random() * currentTweets.length)];
		var randPhrase = phrases[Math.floor(Math.random() * phrases.length)];

		T.post('statuses/update', { status: '.@' + randTweet.user + ' ' + randPhrase + ' ' + endingPhrase, in_reply_to_status_id: randTweet.replyId }, function(err, data, response) {
		})

		//reset cache
		currentTweets = [];
	}
}, config.minTweetIntervalSeconds * 1000)

function getAndPostSummary() {
	T.get('statuses/mentions_timeline', {"count":200}, function (err, data, response) {
		if(data != undefined)
		{
			var currentReplies = "";
			for (var i = 0; i < data.length; i++) {
				var tweet = data[i]["text"];

				tweet = filterWord(tweet);
				tweet = filterWord(tweet);

				currentReplies += tweet;
			}

			var frequentWords = Gramophone.extract(currentReplies, {stopWords:config.stopWords});
			var summary = constructSummaryTweetWithFrequentWords(frequentWords);
			console.log(summary);

			T.post('statuses/update', { status: summary}, function(err, data, response) {});
		}
	})
}

function filterWord(word)
{
	var withoutUsernames = word.replace(/@([A-Za-z0-9_]+)/, "").trim();
	var withoutRetweets = withoutUsernames.replace(/RT([A-Za-z0-9_]+)/, "").trim();
	var withoutQuotes = withoutRetweets.replace(/"(.*?)"/, "").trim();

	return withoutQuotes;
}

function constructSummaryTweetWithFrequentWords(frequentWords)
{
	var summary = config.summaryPrefix;

	var counter = 0;

	for (var i = 0; i < frequentWords.length; i++) {
		var predicatedSummary = summary + " '" + frequentWords[i] + "'";

		if(predicatedSummary.length < config.twitterLimit)
		{
			summary = predicatedSummary;
		} else
			break;
	}

	return summary;
}

setInterval( function() {
	getAndPostSummary();
}, config.summaryIntervalSeconds * 1000)