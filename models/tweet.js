var mongoose = require("mongoose");

var tweetSchema = mongoose.Schema({
    text: String,
    created_at: String,
    user: {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
    },
    Joy: Number,
    Sadness: Number,
    Fear: Number,
    Disgust: Number,
    Anger: Number,
    emotion: String
});

module.exports = mongoose.model("Tweet", tweetSchema);