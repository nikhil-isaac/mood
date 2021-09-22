var express = require("express");
var router = express.Router();
var passport = require("passport");
var Client = require("../models/client");
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

//home page
router.get("/", function(req, res){
    User.find({}, function(err, allUsers){
        if(err){
            console.log(err);
        } else{
            //console.log(allUsers);
            res.render("home",{data: allUsers});
        }
    })
   // res.render("home");
});

//app.use(express.static('public'));
router.get("/search", function(req, res) {
    res.render("search.ejs");
});   


//==========
// AUTH ROUTES
//==========
//show register form
router.get("/register", function(req, res){
    res.render("register");
});

//handling user sign up
router.post("/register",function(req, res){
    //res.send("Register Post Route");
    req.body.username
    req.body.password
    Client.register(new Client({username: req.body.username}), req.body.password, function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            User.findOne({screen_name: req.body.username}, function(err, foundUser){
                if(err){
                    console.log(err);            
                } else{
                    if(foundUser) {
                        console.log("User already Existing in the db");
                        res.redirect("followers");
                        //res.render("profile",{user: foundUser});
                    } else{
                        var data = twitter.getUser({ screen_name: req.body.username}, function(error, response, body){
                            res.send({
                                "error" : error
                            });
                        }, function(data){
                            //res.send(data);
                            var parsedData = JSON.parse(data);
                            console.log(parsedData);
                            User.create({
                                screen_name: parsedData.screen_name,
                                name: parsedData.name,
                                profile_pic: parsedData.profile_image_url_https.replace(/_normal/g,'_400x400'),
                                background_pic: parsedData.profile_banner_url,
                                overall_emotion: "neutral",
                                current_emotion: "neutral",  
                                tokens: 3,  
                                gratitude: 0,
                                followers_count: parsedData.followers_count
                                }, function(err, mainUser){
                                    console.log("New user added to the db");
                                    console.log(mainUser);
                                    res.redirect("followers");               
                        });
                    });
                    }
                }
            });
        })
    })
});

//show login form
router.get("/newUser", function(req, res) {
    res.render("new");
});

//show login form
router.get("/login", function(req, res) {
    res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect:"/followers",
        failureRedirect: "/login",
    }), function(req, res){
});
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success","Logged Out");
    res.redirect("/");
});


module.exports = router;