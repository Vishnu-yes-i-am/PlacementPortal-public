const mongoose = require("mongoose");

const ApprovedDriveSchema = new mongoose.Schema({
    recruiterId: String,
    driveType: { type: String, enum: ["internship", "fulltime"] },
    driveId: Number,
    companyName: {
        type: String,
        required: true
    },
    logo: { type: String, default: "/assets/images/logo-placeholder.png" },
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
    processIni: {
        prePlacementTalk: { req: Boolean, time: Date, duration: String },
        TechnicalPresentation: { req: Boolean },
        apptitudeTest: { req: Boolean, time: Date, duration: String },
        technicalTest: { req: Boolean, time: Date, duration: String },
        gd: { req: Boolean },
        personalInterview: { req: Boolean, time: Date, duration: String },
        waitlistProvosion: { req: Boolean },
        finalOffer: { announcedOn: String }
    },
    applied: [{ candidateId: String, status: { type: String, default: "pending" } }],
    process: {
        currentStatus: { type: String, enum: ["s1", "s2", "s3"], default: "s1" },
        statusMsg: {
            coordinator: {
                "s1": { type: String, default: "Company is waiting for the list of students" },
                "s2": { type: String, default: "List Sent. Result not declared yet" },
                "s3": { type: String, default: "Result Declared" }

            }, recruiter: {
                s1: { type: String, default: "list Pending" },
                s2: { type: String, default: "list Received. Result Pending" },
                s3: { type: String, default: "Result Declared" }
            }
        }
    },
    rounds: [{ roundNo: Number, roundName: String, eventID: String, announced: { type: Boolean, default: false }, sortlistedCandidates: [{ candidateId: String }], announcedAt: Date, timeSlot: Date, duration: { type: Number, default: 60 } }]
    ,
    contact: {
        personName: String,
        email: String,
        address: String,
        mobile: String,
        phone: String,
        fax: String
    },
    approvedBy: String,
    approvedOn: Date,
    handler: String,
    instructions: String,
    deadline: Date,
    c1: String,
    c2: String,
    c3: String

});
const ApprovedDrive = mongoose.model("ApprovedDrive", ApprovedDriveSchema);
module.exports = ApprovedDrive;
