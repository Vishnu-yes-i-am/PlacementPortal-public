const mongoose = require("mongoose");
const PostedDriveSchema = new mongoose.Schema({
    recruiterId: String,
    driveId: Number,
    logo: { type: String, default: "/assets/images/logo-placeholder.png" },
    driveType: { type: String, enum: ["internship", "fulltime"] },
    companyName: {
        type: String,
        required: true
    },
    postedDate: Date,
    website: String,
    orgType: String,
    industrySector: [{ type: String }],
    jobDesig: String,
    jobDesc: String,
    joiningDate: Date,
    workLocations: [{ country: String, state: String, city: String }],
    branches: [{ type: String }],
    positions: Number,
    package: String,
    ctcifppo: String,
    requirements: { cgpa: Number, medical: String, others: String },
    visitDate: Date,
    executivesVisiting: Number,
    roomsRequired: Number,
    drive_approved: { type: Boolean, default: false },
    drive_declined: { type: Boolean, default: false },
    declinedBy: String,
    declinedOn: Date,
    process: {
        prePlacementTalk: { req: Boolean, time: Date, duration: String },
        TechnicalPresentation: { req: Boolean },
        apptitudeTest: { req: Boolean, time: Date, duration: String },
        technicalTest: { req: Boolean, time: Date, duration: String },
        gd: { req: Boolean },
        personalInterview: { req: Boolean, time: Date, duration: String },
        waitlistProvosion: { req: Boolean },
        finalOffer: { announcedOn: String }
    },
    contact: {
        personName: String,
        email: String,
        address: String,
        mobile: String,
        phone: String,
        fax: String
    }
});

const PostedDrive = mongoose.model("PostedDrive", PostedDriveSchema);
module.exports = PostedDrive;
