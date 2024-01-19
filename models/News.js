const { default: mongoose } = require('mongoose');
const mongo = require('mongoose')

const NewsSchema = new mongo.Schema({
    title: { type: String, default: null },
    News: { type: String, default: null },
    time: Date,
    link: String
})
module.exports = mongoose.model('News', NewsSchema)