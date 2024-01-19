const { default: mongoose } = require('mongoose');
const mongo = require('mongoose')

const FeedbackSchema = new mongo.Schema({
    recruiterId: { type: String, unique: true },
    feed: [{ feedmsg: String, rating: Number }],
    filled: { type: Boolean, default: false },
})
module.exports = mongoose.model('Feedback', FeedbackSchema)