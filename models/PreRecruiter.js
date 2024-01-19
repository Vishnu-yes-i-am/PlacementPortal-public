const { default: mongoose } = require('mongoose')
const mongo = require('mongoose')
const PreRecruiterSchema = new mongo.Schema({
    company_name: String,
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    mobile: String,
    orgType: String,
    msg: String,
    status: String,
    takenBy: String,
    takenAt: Date,
    history: [{ status: String, forwarded: String, time: Date, lastupdate: { type: Boolean, default: true }, note: String, sender: String }]
});
module.exports = mongoose.model('PreRecruiter', PreRecruiterSchema)
