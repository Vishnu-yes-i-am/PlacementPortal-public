const express = require("express");
const Str = require('@supercharge/strings')
const router = express.Router();
const Coordinator = require("../models/Coordinator");
const Recruiter = require("../models/Recruiter");
const PostedDrive = require("../models/PostedDrive");
const News = require("../models/News");
const ApprovedDrive = require("../models/ApprovedDrive");
const middleware = require('../middleware/auth');
const { ObjectId } = require("mongodb");
const { sendEmail } = require("../API/Mail/mail");

// add roles

//add person role
router.post("/add_role", middleware.login_admin, async (req, res) => {
    let fname = req.body.fname;
    let lname = req.body.lname;
    let cusername = req.body.clgusername;
    let mobile = req.body.mobile;
    let gender = req.body.gender;
    let role = req.query.role;
    let password = Str.random(10);
    let new_role = new Coordinator({ name: fname + " " + lname, password: password, email: cusername + "@mnit.ac.in", mobile: mobile, gender: gender, role: role });
    try {
        await new_role.save();
        let tpos = await Coordinator.find({ role: 1 });
        let fcs = await Coordinator.find({ role: 2 });
        let scs = await Coordinator.find({ role: 3 });
        let staff = await Coordinator.find({ role: 4 });
        res.render("./add_role.ejs", { data: req.data, tpos: tpos, fcs: fcs, scs: scs, staff: staff });
    }
    catch (err) {
        console.log(err);
        res.send("Error");
    }
})
// delete person role
router.get("/delete_person", middleware.login_admin, async (req, res) => {
    let id = req.query.id;
    await Coordinator.deleteOne({ _id: id });
    let tpos = await Coordinator.find({ role: 1 });
    let fcs = await Coordinator.find({ role: 2 });
    let scs = await Coordinator.find({ role: 3 });
    let staff = await Coordinator.find({ role: 4 });
    res.render("./add_role.ejs", { data: req.data, tpos: tpos, fcs: fcs, scs: scs, staff: staff });
})
//creating role for coordinators
router.get("/create_role", middleware.login_admin, async (req, res, next) => {
    let tpos = await Coordinator.find({ role: 1 });
    let fcs = await Coordinator.find({ role: 2 });
    let scs = await Coordinator.find({ role: 3 });
    let staff = await Coordinator.find({ role: 4 });
    res.render("./add_role.ejs", { data: req.data, tpos: tpos, fcs: fcs, scs: scs, staff: staff });
});
router.post("/postNews", async (req, res) => {
    const news = new News(Object.assign({}, req.body, { time: new Date() }));
    try {
        await news.save();
        res.redirect("/auth/home_coordinator");
    }
    catch (err) {
        console.log(err);
        res.status(400).send("Error");
    }
})
//approve posted drive
router.post("/approve_drive_request", middleware.login_admin, async (req, res) => {
    const send_to = req.body.sendto;
    const instructions = req.body.instructions;
    const deadline = new Date(req.body.lastdatetime);

    var add_minutes = function (dt, minutes) {
        return new Date(dt.getTime() + minutes * 60000);
    }
    console.log(send_to)
    const handler = await Coordinator.findById(send_to);

    console.log(handler)
    if (!handler || add_minutes(new Date(), 30) > deadline) {
        res.status(403).send("Please Enter valid Data.");
        return
    }

    try {
        let id = req.query.d_id;
        var v_d = (await PostedDrive.find({ _id: id }))[0];
        var new_vd = { ...v_d._doc, ...{ "approvedBy": req.data.name, "approvedOn": new Date(), "handler": send_to, "instructions": instructions, deadline: deadline } }
        const new_drive = new ApprovedDrive(new_vd);
        const rec_email = (await Recruiter.findById(new_vd.recruiterId)).email;
        await new_drive.save()
        await Recruiter.findOneAndUpdate({ _id: v_d.recruiterId, "created_drives.driveId": ObjectId(v_d._id) }, {
            $set: { "created_drives.$.approved": true }
        })
        await PostedDrive.updateOne({ _id: id }, { drive_approved: true });
        let body = `Hi ${v_d.companyName}, <br>
        Your Drive for ${v_d.jobDesig} Request Created On ${new Date(v_d.postedDate).toLocaleString()} Has Been Approved. <br><br>
        You may Login to the <a href="https://placements.mnit.ac.in/" > Placement Portal</a> for Further Details. <br>
        
        DEADLINE : ${new Date(new_vd.deadline).toLocaleString()}

        Thanks,<br>
        Placement & Training Cell<br>
        MNIT Jaipur <br>

        `
        sendEmail(rec_email, "Drive Approved", body);
        res.redirect("/auth/home_coordinator");
    }
    catch (err) {
        console.log(err);
        res.send("Error");
    }
});

//remove posted drive
router.get("/remove_drive_request", middleware.login_admin, async (req, res) => {
    let id = req.query.d_id;
    try {
        await PostedDrive.findOneAndUpdate({ _id: d_id }, {
            $set: { drive_declined: true, declinedBy: req.data.name, declinedOn: new Date() }
        })
        res.redirect("/auth/home_coordinator");
    }
    catch (err) {
        console.log(err);
        res.send("Error");
    }
});
module.exports = router;