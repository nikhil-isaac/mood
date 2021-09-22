var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var ClientSchema = new mongoose.Schema({
    username: String,
    twitterName: String, 
    password: String
});

ClientSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Client", ClientSchema)