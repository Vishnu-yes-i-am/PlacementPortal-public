const { default: mongoose } = require('mongoose');
const mongo = require('mongoose')

const QuerySchema = new mongo.Schema({
    recruiterId: { type: String, unique: false },
    query: [{ title: { type: String, default: null }, querymsg: String }],
})
module.exports = mongoose.model('Query', QuerySchema)