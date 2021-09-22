let express        = require('express'),
    router         = express.Router(),
    SpotifyWebApi  = require('spotify-web-api-node'),
    request        = require('request'),
    bodyParser     = require('body-parser'),
    querystring    = require('querystring');
var User = require("../models/user");
var Spotify = require("../models/spotify");
var middleware = require("../middleware");

let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8888/callback'

var spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: 'http://localhost:8888/callback'
    });

router.get('/spotify/login', middleware.isLoggedIn,function(req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: 'user-read-private user-read-email',
        redirect_uri
      }));
  });
  router.get('/callback/:id', middleware.isLoggedIn,function(req, res) {   
    // your application requests authorization
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization:
          'Basic ' +
          new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true
    };  

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
      
        // use the access token to access the Spotify Web API
        let token = body.access_token;
        res.redirect("/spotify/" + req.params.id + "/query" + '?access_token=' + token);
                
        }
   })
  });

  router.get("/spotify/:id/query", middleware.isLoggedIn,function(req, res){
    token = req.query.access_token;
    res.render("spotify/query", {follower_id:req.params.id})
  });

  router.post("/spotify/:id/new", middleware.isLoggedIn,function(req, res){
    console.log(req.body);
    if (req.body.param_type == "playlists"){
      res.redirect("/spotify/"+ req.params.id + "/playlists"+'?param_query=' + req.body.param_query+ '&param_type=' + req.body.param_type);
    }
  });

  router.get("/spotify/:id/playlists", middleware.isLoggedIn,function(req, res){
    var q = req.query.param_query;
    var param_type = req.query.param_type;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization:
          'Basic ' +
          new Buffer(process.env.SPOTIFY_CLIENT_ID+ ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        // use the access token to access the Spotify Web API
        let token = body.access_token;
        spotifyApi.setAccessToken(token);              
        // Search playlists whose name or description contains 'workout'
        spotifyApi.searchPlaylists(q)
        .then(function(data) {
          res.render("spotify/playlists",{data: data.body,follower_id:req.params.id, type:param_type});
        }, function(err) {
        console.log('Something went wrong!', err);
        });
        }
      });
  });

router.post("/followers/:id/spotify", middleware.isLoggedIn,function(req, res){
  User.findById(req.params.id, function(err, follower) {
    if(err){
        console.log(err);
        res.redirect("/followers");
    } else{
      console.log(req.body.spotify);
      Spotify.create(req.body.spotify, function(err,spotify) {
        if(err){
            console.log(err);
        } else{
            //add username and id to message
            spotify.sender.id = req.user._id;
            spotify.sender.username = req.user.username;
            spotify.receiver.id = req.params.id;
            //save message
            spotify.save();
            follower.spotify_items.push(spotify);
            follower.save();
            res.redirect('/followers/' + follower._id);            
        }
      });
    }
  });
});

module.exports = router;