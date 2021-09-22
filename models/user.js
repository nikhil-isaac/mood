let mongoose = require("mongoose");

//User - 
let userSchema = new mongoose.Schema({
    screen_name: String,
    name: String,
    profile_pic: String,
    background_pic: String, 
    followers_count: Number,
    followers:  [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    messages:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
    spotify_items:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Spotify"
        }
    ],
    tweets:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet"
        }
    ],
    tokens: Number,
    latest_tweets: Array, 
    overall_emotion: String,
    current_emotion: String,
    gratitude: Number
});
module.exports = mongoose.model("User", userSchema);