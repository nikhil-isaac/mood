var express = require("express");
var router = express.Router();
var User = require("../models/user");
var middleware = require("../middleware");

router.get("/token/:id", function(req, res){
    res.render("token/send", {follower: req.params.id});
});
router.post("/token/:id", function(req, res){
    var choice = req.body.choice;
    var receiver_username = req.params.id;
    console.log(req.params.id);
    console.log(req.user);
    var username = req.user.username;
    //what i
    User.findOne({ screen_name:username}, function(err, user){
        if(err){
            console.log(err);
            res.send(err);
        } else{
            //Check the response
            console.log(typeof user.tokens);
            console.log(user);
            console.log(user.tokens);
            if(choice == "Yes") {
                //check sender balance  
            if(user.tokens>=1){
                //update the receiver balance by one
                User.findOne({ screen_name:receiver_username}, function(err, follower){
                    if(err){
                        console.log(err);
                        res.send(err);
                    } else{
                        console.log(follower);                        
                        follower.tokens += 1;
                        follower.save();
                        user.tokens -= 1;
                        user.gratitude += 1;
                        user.save();
                        res.redirect("/profile");
                    }
                });
            } else {
                res.send("Balance in sufficent");
            }
            } else {
                res.redirect("/profile");
            }
            
        }
    });
    
});
module.exports = router;