var mongoose = require("mongoose");

var spotifySchema = mongoose.Schema({
    text: String,
    name: String,
    image: String,
    link: String,
    type: String,
    sender: {
        id: {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    receiver: {
        id: {
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
});

module.exports = mongoose.model("Spotify", spotifySchema);