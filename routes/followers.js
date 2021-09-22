var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Message = require("../models/message");
var twitter = require('../routes/tweets');
var Spotify = require("../models/spotify");
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

//get the profile of the user from the databse
router.get('/profile', function(req, res){
    var username = req.user.username;
    User.findOne({ screen_name:username}).populate("messages").populate("spotify_items").exec(function(err, user){
        if(err){
            console.log(err);
            res.redirect("/");
        } else{  
            console.log(user)
            res.render("profile", {user:user});
            //res.send(user);
        }
    });
});
//get all followers data from the database:
router.get('/followers', middleware.isLoggedIn, function (req, res) {
    var username = req.user.username;
    User.findOne({ screen_name:username}).populate("followers").exec(function(err, user){
        if(err){
            console.log(err);
            res.redirect("/");
        } else{            
            if (user){
                res.render("followers/index",{data: user["followers"], currentUserId: user._id, currentUser: req.user});                
            } else {
                res.redirect("/");
            }
            
        }
    });
});   

//Shows more information about one follower
router.get("/followers/:id", middleware.isLoggedIn, function(req, res){
    //find the follower with the provided ID
    //render show template with that follower
    User.findById(req.params.id).populate("messages").populate("spotify_items").exec(function(err, foundFollower) {
        if(err){
            console.log(err);
        } else{
            res.render("followers/show", {follower: foundFollower})
        }
    });
});

//==================
// Message Routes
//=================
router.get("/followers/:id/messages/new", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, follower) {
        if(err){
            console.log(err);
        } else{
            res.render("messages/new", {follower: follower});
        }
    })
    //res.render("messages/new")
});   

router.post("/followers/:id/messages", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, follower) {
        if(err){
            console.log(err);
            res.redirect("/followers");
        } else{
            Message.create(req.body.message, function(err,message) {
                if(err){
                    console.log(err);
                } else{
                    //add username and id to message
                    message.sender.id = req.user._id;
                    message.sender.username = req.user.username;
                    message.receiver.id = req.params.id;
                    //save message
                    message.save();
                    follower.messages.push(message);
                    follower.save();
                    res.redirect('/followers/' + follower._id);
                }
            });
        }
    });
});  
module.exports = router;
