var express = require("express");
var router = express.Router();
var User = require("../models/user");
var twitter = require('../routes/tweets');
var middleware = require("../middleware");

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

//post to retrieve user data
router.post('/twitter', middleware.isLoggedIn, function (req, res) {  
    //Collection.find()  
    //var username = req.body.screen_name;  
    var username = req.user.username;  
    //console.log(username);
    User.findOne({screen_name: username}).populate("followers").exec(function(err, mainUser){
        if(err){
            console.log(err);
        } else{  
            var tempcount = 0;          
            mainUser["followers"].forEach(function(user) {
                var data = twitter.getUserTimeline({ screen_name: user["screen_name"], count:1 }, function(error, response, body){
                    // res.send({
                    //     "error" : error
                    // });
                    console.log(err);
                    //console.log(err);
                    //throw err;
                }, function(data){                    
                    //parse the most recent tweets (note cannot mention the date)
                    var parseData = JSON.parse(data);
                    tweets = {};
                    storageData={};
                    //console.log(parseData); 
                    //date_time = parseData[0]["created_at"];             
                    if(parseData.length>0) {

                    
                        //recent_tweets = parseData[0]["text"];
                        date_time = parseData[0]["created_at"];             
                        
                        recent_tweets = parseData[0]["text"];
                        //console.log(recent_tweets); 
                        //if the recent tweet is not the one stored then call watson and store the tweet and emotion
                        if(recent_tweets != user["latest_tweets"][0] || user["current_emotion"] == "neutral"){
                            user["latest_tweets"].unshift(recent_tweets);
                            //send the most recent day tweets to the ibm watson
                            toneAnalyzer.tone(
                                {
                                tone_input: recent_tweets,
                                content_type: 'text/plain'
                                },
                                function(err, tone) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    // tone
                                    console.log(JSON.stringify(tone, null, 2));
                                    max_score = 0;
                                    max_emotion = "";
                                    
                                    tone.document_tone["tone_categories"][0]["tones"].forEach(function(sound) {
                                        if(sound.score>max_score) {
                                            max_score = sound.score;
                                            max_emotion = sound.tone_name;
                                        }    
                                        if(max_emotion){
                                            user["current_emotion"]=max_emotion;
                                        }  else{
                                            user["current_emotion"]="neutral";
                                        }
                                                                      
                                    });
                                    //console.log(max_emotion);
                                    //console.log(user);
                                    User.findOne({screen_name: user["screen_name"]}, function(err, foundUser){
                                        if(err){
                                            console.log(err);
                                        } else {
                                            foundUser["current_emotion"] = user["current_emotion"];
                                            foundUser["latest_tweets"] = user["latest_tweets"];                                                       
                                            foundUser.save(function(err,data ){
                                                if(err){
                                                    console.log(err);
                                                } else{
                                                    console.log("Successully updated the latest tweets and current emotion");
                                                    console.log(data);
                                                    tempcount = tempcount + 1;
                                                    if(tempcount ==Math.round(0.75*mainUser.followers.length)){
                                                        res.redirect("/followers");
                                                    }
                                                }
                                            });   
                                    } 
                                    });     
                                }//$
                        
                                });//$  
                            } else{
                                console.log("Follower already with the updated tweet");
                                tempcount = tempcount + 1;
                                if(tempcount == Math.round(0.75*mainUser.followers.length)){
                                    res.redirect("/followers");
                                }
                            }
                        } else{
                            console.log("Follower has no tweets");
                                tempcount = tempcount + 1;
                                if(tempcount > Math.round(0.75*mainUser.followers.length)){
                                    res.redirect("/followers");
                                }
                        }
                        console.log(tempcount);
                }); 
               
                
            });
            
        }
        });
        
   
        
});
module.exports = router;