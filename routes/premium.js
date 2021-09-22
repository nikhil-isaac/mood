var express = require("express");
var router = express.Router();
var User = require("../models/user");
var middleware = require("../middleware");
var twitter = require('../routes/tweets');
var Tweet = require("../models/tweet");


module.exports = require('../node_modules/twitter-node-client/lib/Twitter');
var config = {
    "consumerKey": process.env.CONSUMER_KEY,
    "consumerSecret": process.env.CONSUMER_SECRET,
    "accessToken": process.env.ACCESS_TOKEN,
    "accessTokenSecret": process.env.ACCESS_TOKEN_SECRET,
    "callBackUrl": "xxx"
}

var twitter = new module.exports.Twitter(config);
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var toneAnalyzer   = new ToneAnalyzerV3({
  username: process.env.TONE_USERNAME,
  password: process.env.TONE_PASSWORD,
  version: '2016-05-19',
  url: 'https://gateway.watsonplatform.net/tone-analyzer/api/'
});
router.get("/premium/:id", function(req, res) {
    var user_id = req.params.id;
    User.findById(req.params.id).populate("tweets").exec(function(err, follower) {
        if(err){
            console.log(err);
        } else {
            res.render("premium/historical", {follower: follower});
        }
    });
});

router.post("/premium/:id/add", function(req, res) {
    var user_id = req.params.id;
    User.findById(req.params.id).populate("tweets").exec(function(err, follower) {
        if(err){
            console.log(err);
        } else {
            var tempcount = 0;
            var data = twitter.getUserTimeline({ screen_name: follower["screen_name"], count:10 }, function(error, response, body){
                // res.send({
                //     "error" : error
                // });
                console.log(err);
                //console.log(err);
                //throw err;
            }, function(data){  
                var parseData = JSON.parse(data);
                    if(parseData.length>0) {
                        var tweets = [];
                        parseData.forEach(function(data) {
                            toneAnalyzer.tone(
                                {
                                tone_input: data["text"],
                                content_type: 'text/plain'
                                },
                                function(err, tone) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    max_score = 0;
                                    max_emotion = "neutral";
                                    console.log(tone);
                                    tone.document_tone["tone_categories"][0]["tones"].forEach(function(sound) {
                                        if(sound.score>max_score) {
                                            max_score = sound.score;
                                            max_emotion = sound.tone_name;
                                        }      
                                        //user["current_emotion"]=max_emotion;                              
                                    });
                                    Tweet.create({}, function(err,tweet) {
                                        if(err){
                                            console.log(err);
                                        } else{ 
                                            tweet.user = follower._id;                                    
                                            tweet.created_at = data["created_at"];
                                            tweet.text= data["text"];
                                            tweet.Joy= 1;
                                            tweet.Sadness= 2;
                                            tweet.Fear= 3;
                                            tweet.Disgust= 4;
                                            tweet.Anger= 5; 
                                            tweet.emotion = max_emotion; 
                                            tweets.push()
                                            tweet.save(function(err,data){
                                                if(err){
                                                    console.log(err);
                                                } else{
                                                    console.log("Successully added the tweet");
                                                    console.log(data);                                    
                                                    tempcount += 1;   
                                                    console.log(tempcount);
                                                    if(tempcount == 10) {
                                                        res.render("premium/historical", {follower: follower});
                                                    } 
                                                    if(tempcount == parseData.length) {
                                                        res.render("premium/historical", {follower: follower});
                                                    }
                                                }
                                            });                               
                                            //follower.tweets.push(tweet);
                                            //follower.update();
                                            
                                            //console.log(follower);
                                            //tweets.push(tweet);
                                        }
                                    });
                                }
                                });
                            });
                        //}
                        //console.log(tempcount)
                    //}); 
                    } else {
                        res.send("User has no tweets");
                    }

            });
        }
    });
});
router.post("/premium/:id/sync", function(req, res) {
    var user_id = req.params.id;
    Tweet.find({user: req.params.id}, function(err, tweet){
        if(err){
            console.log(err);
            
        } else{
            //TODO SORT tweets
            //res.send(tweet);
            User.findById(req.params.id).populate("tweets").exec(function(err, follower) {
                if(err){
                    console.log(err);
                } else {
                    //console.log(tweet);
                    //console.log(tweet.length);
                    //console.log(follower.tweets);
                    follower.tweets = follower.tweets.concat(tweet);                    
                    //console.log(follower.tweets);
                    follower.save(function(err,data){
                        if(err){
                            console.log(err);
                        } else{
                            console.log("Successully added the tweets");
                            console.log(data);                                    
                            res.render("premium/historical", {follower: follower});                            
                        }
                    });
                }
            });
        }
    });
});
router.post("/premium/:id/analyze", function(req, res) {
    var user_id = req.params.id;
    
    //TODO SORT tweets
    //res.send(tweet);
    User.findById(req.params.id).populate("tweets").exec(function(err, follower) {
        if(err){
            console.log(err);
        } else {
            emtable = {
                Joy: [],
                Sadness: [],
                Fear: [],                           
                Disgust: [],                            
                Anger: [],
                neutral: []                          
            }
            console.log(emtable);
            follower.tweets.forEach(function(tweet) {
                //find most dominant emotion
                if(tweet.emotion) {
                    emtable[tweet.emotion].push(tweet);
                }               
            });
            max_score = 0;
            overall_emotion = "";
            Object.keys(emtable).forEach(function(key) {
                if(emtable[key].length>max_score){
                    max_score = emtable[key].length;
                    overall_emotion = key ;                    
                }
            });
            console.log(overall_emotion);
            res.render("premium/historical", { follower:follower, overall_emotion: overall_emotion});
        }
    });
});

router.post("/premium/:id", function(req, res) {
    var user_id = req.params.id;
    User.findById(req.params.id).populate("tweets").exec(function(err, follower) {
        if(err){
            console.log(err);
        } else {
            var data = twitter.getUserTimeline({ screen_name: follower["screen_name"], count:10 }, function(error, response, body){
                // res.send({
                //     "error" : error
                // });
                console.log(err);
                //console.log(err);
                //throw err;
            }, function(data){                    
                //parse the most recent tweets (note cannot mention the date)
                var parseData = JSON.parse(data);
                if(parseData.length>0) {
                    tweets = [];
                    if(follower.tweets.length== 0) {
                        parseData.forEach(function(data) {
                        
                            Tweet.create({}, function(err,tweet) {
                                if(err){
                                    console.log(err);
                                } else{ 
                                    tweet.user.id = follower._id;                                    
                                    tweet.created_at = data["created_at"];
                                    tweet.text= data["text"];
                                    tweet.Joy= 1;
                                    tweet.Sadness= 2;
                                    tweet.Fear= 3;
                                    tweet.Disgust= 4;
                                    tweet.Anger= 5;  
                                    //tweets.push()
                                    tweet.save();
                                    follower.tweets.push(tweet);
                                    follower.update();
                                    
                                    //console.log(follower);
                                    //tweets.push(tweet);
                                }
                            });
                            //push all the tweets to the follower
                            //and save the new created tweets
                        });
                        console.log("No Tweets present in the db");

                    } else {
                         var new_tweet = {
                        id: follower._id,
                        created_at: parseData[0]["created_at"],
                        text: parseData[0]["text"],
                        Joy: 1,
                        Sadness: 2,
                        Fear: 3,
                        Disgust: 4,
                        Anger: 5 
                    };
                    Tweet.create(new_tweet, function(err,tweet) {
                        if(err){
                            console.log(err);
                        } else{
                            tweet.save();
                            follower["tweets"].unshift(tweet);
                            follower.save();
                            console.log("latest tweet added")
                            //console.log(follower);
                            //res.render("premium/historical", {follower: follower});
                        }
                    });
                        var recent_tweet = parseData[0]["text"];
                        //console.log(recent_tweet);
                        //console.log(follower["tweets"][0].text);
                        //console.log(recent_tweets); 
                        //if the recent tweet is not the one stored then call watson and store the tweet and emotion
                        for(var i = 0; i< parseData.length; i++){
                            var flag = 0;
                            for(var j =0; j<follower["tweets"].length;j++){
                                if(parseData[i]["text"]==follower["tweets"][j].text){
                                    flag = 1;
                                    break;
                                }
                            } 
                            //not present then 
                            if(flag == 0){
                                var new_tweet = {
                                    id: follower._id,
                                    created_at: parseData[0]["created_at"],
                                    text: parseData[0]["text"],
                                    Joy: 1,
                                    Sadness: 2,
                                    Fear: 3,
                                    Disgust: 4,
                                    Anger: 5 
                                };
                                Tweet.create(new_tweet, function(err,tweet) {
                                    if(err){
                                        console.log(err);
                                    } else{
                                        tweet.save();
                                        follower["tweets"].unshift(tweet);
                                        follower.save();
                                        console.log("latest tweet added")
                                        //console.log(follower);
                                        //res.render("premium/historical", {follower: follower});
                                    }
                                });

                            }
                            
                            
                        }
                
                        // if(recent_tweet != follower["tweets"][0].text){
                        //     var new_tweet = {
                        //         id: follower._id,
                        //         created_at: parseData[0]["created_at"],
                        //         text: parseData[0]["text"],
                        //         Joy: 1,
                        //         Sadness: 2,
                        //         Fear: 3,
                        //         Disgust: 4,
                        //         Anger: 5 
                        //     };
                        //     Tweet.create(new_tweet, function(err,tweet) {
                        //         if(err){
                        //             console.log(err);
                        //         } else{
                        //             tweet.save();
                        //             follower["tweets"].unshift(tweet);
                        //             follower.save();
                        //             console.log("latest tweet added")
                        //             //console.log(follower);
                        //             res.render("premium/historical", {follower: follower});
                        //         }
                        //     });
                        // } else {
                        //     console.log("Already with the latest tweets");
                        //     //console.log(follower);
                        //     res.render("premium/historical", {follower: follower});
                        // }
                    }
                    
                    //res.render("premium/historical", {follower: follower});        
                    
                    //var tweetString = JSON.stringify(tweets);
                    // console.log(tweetString);
                    //res.send(tweets);
                    //res.render("premium/show", {follower: follower});
                } else{
                    res.send("Follower has no tweets");
                }
            //}
            });
        }
    });
    // res.render("premium/show", {follower: req.params.id});
});
router.post("/premium/:id/new", function(req, res) {
    var user_id = req.params.id;
    User.findById(req.params.id).populate("tweets").exec(function(err, follower) {
        if(err){
            console.log(err);
        } else {
            var data = twitter.getUserTimeline({ screen_name: follower["screen_name"], count:10 }, function(error, response, body){
                // res.send({
                //     "error" : error
                // });
                console.log(err);
                //console.log(err);
                //throw err;
            }, function(data){           
                    
                //parse the most recent tweets (note cannot mention the date)
                var parseData = JSON.parse(data);
                if(parseData.length>0) {
                    tweets = [];
                    if(follower.tweets.length== 0) {
                        parseData.forEach(function(data) {
                            Tweet.create({}, function(err,tweet) {
                                if(err){
                                    console.log(err);
                                } else{
                                    tweet.user.id = follower._id;
                                    tweet.created_at = data["created_at"];
                                    tweet.text= data["text"];
                                    tweet.Joy= 1;
                                    tweet.Sadness= 2;
                                    tweet.Fear= 3;
                                    tweet.Disgust= 4;
                                    tweet.Anger= 5;  
                                    //tweets.push()
                                    tweet.save();
                                    follower.tweets.push(tweet);
                                    //follower.update();
                                    
                                    //console.log(follower);
                                    //tweets.push(tweet);
                                }
                            });
                            //push all the tweets to the follower
                            //and save the new created tweets
                        });
                        console.log("No Tweets present in the db");
                    }
                } else {
                    res.send("Follower has no tweets");
                }
        });

    }
});
});
//get tweets from db


// router.post('/premium/:id/synchronize', middleware.isLoggedIn, function (req, res) {
//     var user_id = req.params.id;
//     User.findById(req.params.id).populate("tweets").exec(function(err, follower) {
//         if(err){
//             console.log(err);
//         } else {
//             var data = twitter.getUserTimeline({ screen_name: follower["screen_name"], count:10 }, function(error, response, body){
//                 // res.send({
//                 //     "error" : error
//                 // });
//                 console.log(err);
//                 //console.log(err);
//                 //throw err;
//             }, function(data){  
//                 var parseData = JSON.parse(data);
//                 parseData.forEach(function(data) {
//                     //check if all the tweets are present
//                     follower.tweets.forEach(function(tweet) {
//                         if(data)
//                     });

//                 });
                

// router.post("/premium/:id", function(req, res){
module.exports = router;