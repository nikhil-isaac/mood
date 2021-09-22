var express = require("express");
var router = express.Router();
var User = require("../models/user");
var middleware = require("../middleware");

var twitter = require('../routes/tweets');
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

//post the followers data to the database
router.post('/followers/new', middleware.isLoggedIn, function (req, res) {
    //need to get data from twitter about the user and then add his/her follower
    //need to check if the user is already existing, if yes then skip the part of creating a new user
    
    var username = req.user.username;
    var userId = req.user._id;
    User.findOne({screen_name: username}).populate("followers").exec( function(err, mainUser){
        if(err){
            console.log(err);            
        } else {
            console.log(mainUser);
        var data = twitter.getFollowersList({ screen_name: username, count: mainUser.followers_count}, function(error, response, body){
            res.send({
                "error" : error
            });
        }, function(data){
            var parsedData = JSON.parse(data);
            var tempcount = 0;

            parsedData["users"].forEach(function(user) {
                User.findOne({screen_name: user["screen_name"]}, function(err, foundUser){
                    if(err){
                        console.log(err);
                        
                    } else{
                        if(foundUser) {
                            console.log("Found a follower in db");
                            console.log(foundUser.screen_name);
                            var foundflag = 0;
                            mainUser.followers.forEach(function(user) {
                                if(user.screen_name == foundUser.screen_name){                                    
                                    foundflag = 1;
                                }
                            });
                            if(foundflag == 0){
                                console.log("Not Found in follower list");
                                console.log(foundUser);
                                mainUser.followers.push(foundUser._id); 
                                mainUser.save();
                                // User.findOneAndUpdate(mainUser._id,mainUser,function(err, data){
                                //     if(err){
                                //         console.log(err);
                                //     } else{
                                //         //process.exit(0);
                                //         console.log("Successfully updated the mainuser");
                                //         console.log(data);
                                //         //data.save();
                                //         //res.redirect("/database");
                                //     }
                                // });
                                // mainUser.update(function(err,data ){
                                //     if(err){
                                //         console.log(err);
                                //     } else{
                                //         console.log(data);
                                //     }
                                // }); 
                                console.log("Found in follower list");
                                console.log("The main user:");
                                console.log(mainUser)
                            }
                                console.log(tempcount);
                                tempcount = tempcount + 1;
                                if(tempcount == 2) {
                                    return res.redirect("/followers");
                                }
                            }
                            else {
                                console.log("Not found in the db");
                                var storageData = {};
                                storageData["screen_name"]=user["screen_name"];
                                storageData["name"]=user["name"];
                                storageData["profile_pic"]=user["profile_image_url_https"].replace(/_normal/g,'_400x400');
                                storageData["latest_tweets"]=[];
                                storageData["profile_banner_url"] = user["profile_banner_url"];
                                storageData["overall_emotion"]="neutral";
                                storageData["current_emotion"]="neutral"; 
                                storageData["tokens"]=3; 
                                storageData["gratitude"]=0; 
                
               
                                User.create(storageData, function(err, newlyCreated){
                                    if(err){
                                        console.log(err);
                                    } else {
                                        console.log("Successully created the new follower in the db");
                                        console.log(newlyCreated);
                                        mainUser.followers.push(newlyCreated._id);
                                        //.save is not working, dont't know why//parallel save execution
                                        mainUser.save();
                                        // User.findOneAndUpdate(mainUser._id,mainUser,function(err, data){
                                        //     if(err){
                                        //         console.log(err);
                                        //     } else{
                                        //         //process.exit(0);
                                        //         console.log("Successfully updated the mainuser");
                                        //         console.log(data);
                                        //         //res.redirect("/database");
                                        //     }
                                        // });
                                        //     tempcount += 1
                                        //     if (tempcount == 2){
                                        //         res.redirect("/new");
                                        //      }
                                        // });
                                    }
                                });   
                                tempcount = tempcount + 1;
                                if(tempcount == 2) {
                                    res.redirect("/followers");
                                }
                            }    
                        }  
            
                    });
                });
            });  
        }
    });
});

module.exports = router;