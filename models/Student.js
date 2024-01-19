const { default: mongoose } = require('mongoose')
var selected = mongoose.Schema({ id: String, domain: String }, { _id: false });
const Str = require('@supercharge/strings');
const mongo = require('mongoose')

const StudentSchema = new mongo.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String
    },
    gender: {
        type: String,
        required: true
    },
    student_id: {
        type: String,
        required: true,
        unique: true
    },
    clg_email: {
        type: String
    },
    profile_image: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String
    },
    programme: {
        type: String
    },
    dob: {
        type: String
    },
    sec_email: {
        type: String,
        unique: true,
        lowercase: true,
    },
    cgpa: {
        type: Number
    },
    backlogs: {
        type: Number,
        default: 0
    },
    branch: {
        type: String,
        required: true
    },
    addmission_year: {
        type: Number,
        required: true
    },
    curr_sem: {
        type: Number
    },
    got_internship: {
        type: Boolean,
        default: false
    },
    placed: {
        type: Boolean,
        default: false
    },
    temp_token: {
        type: String,
        default: Str.random(60)
    },
    nationality: {
        type: String
    },
    github: { type: String, default: "Enter Github Link ..." },
    linkedIn: { type: String, default: "Enter LinkedIn Link ..." },
    inbox: [{ body: String, date: Date, title: String, from: { name: String, id: String, domain: String }, readstatus: { type: Boolean, default: 0 } }],
    skills: { languages: [String], technologies: [String], database: [String] }
    ,
    projects: [{ title: String, link: String, techUsed: String, desc: String }],
    experiences: [{ organisation: String, duration: String, startDate: String, desc: String, role: String }],
    education: { s10: { school_name: String, address: String, percentage: String, passing_year: Number, board: String, saved: { type: Boolean, default: false } }, s12: { school_name: String, address: String, percentage: String, passing_year: Number, board: String, saved: { type: Boolean, default: false } } },
    flags: [{ count: Number, time: { type: Date, default: Date.now() }, by: String, reason: String }],
    flagcount: { type: Number, default: 0 },
    flaggedUntil: { type: Date, default: new Date(0) },
    appliedIn: [{ driveId: String, status: String, process: [{ round: Number, roundName: String, passed: { type: Boolean, default: false }, reason: String }] }],
    passwordChangedAt: Date,
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false }

})
module.exports = mongoose.model('Student', StudentSchema)