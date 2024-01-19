const { default: mongoose } = require('mongoose')
const mongo = require('mongoose')
const RecruiterSchema = new mongo.Schema({
    company_name: String,
    email: {
        type: String,

    },
    password: String,
    mobile: String,
    orgType: String,
    company_description: String,
    inbox: [{ msgId: Number, body: String, date: Date, title: String, from: { name: String, id: String, domain: String }, readstatus: { type: Boolean, default: 0 } }],
    address: String,
    logo: String,
    checkBox: [{ id: String, domain: String }],
    temp_token: String,
    drivesCount: { type: Number, default: 0 },
    created_drives: [{ driveId: String, approved: { type: Boolean, default: false } }],
    resetPasswordToken: {type: String, required: false},
    resetPasswordExpires: {type: Date, required:false}
});
module.exports = mongoose.model('Recruiter', RecruiterSchema)
