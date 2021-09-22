var mongoose = require("mongoose");

var messageSchema = mongoose.Schema({
    text: String,
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

module.exports = mongoose.model("Message", messageSchema);