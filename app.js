module.exports = require('./node_modules/twitter-node-client/lib/Twitter');

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var toneAnalyzer   = new ToneAnalyzerV3({
    username: process.env.TONE_USERNAME,
    password: process.env.TONE_PASSWORD,
    version: '2016-05-19',
    url: 'https://gateway.watsonplatform.net/tone-analyzer/api/'
});
var express        = require('express'),
    app            = express(),
    bodyParser     = require('body-parser'),
    mongoose       = require("mongoose"),
    flash          = require('connect-flash'),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    Client           = require("./models/client"),
    seedDB           = require("./seeds")
//Seed the database
//seedDB();

var twitterRoutes = require("./routes/tweets")
var tweetstowatsonRoutes = require("./routes/tweetstowatson"),
    synchronizeRoutes = require("./routes/synchronize"),
    followersRoutes = require("./routes/followers"),
    indexRoutes = require("./routes/index"),
    spotifyRoutes = require("./routes/spotify"),
    tokenRoutes = require("./routes/token"),
    premiumRoutes = require("./routes/premium")
    

mongoose.connect("mongodb://localhost/twitter");
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
}));
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(flash());


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Tough Time Never Last Tough People do",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Client.authenticate()));
passport.serializeUser(Client.serializeUser());
passport.deserializeUser(Client.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");    
    next();
});
var Message = require("./models/message");
var User = require("./models/user");


app.use(indexRoutes);
app.use(followersRoutes);
app.use(tweetstowatsonRoutes);
app.use(synchronizeRoutes);
app.use(spotifyRoutes);
app.use(tokenRoutes);
app.use(premiumRoutes);
//app.use(twitterRoutes);



var server = app.listen(8888, function () {
    console.log("Server at 8888");
  	var host = server.address().address;
  	var port = server.address().port;
});
	