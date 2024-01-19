const express = require("express");
const Str = require('@supercharge/strings')
const router = express.Router();
const dotenv = require('dotenv');
const path = require("path");
const Student = require("../models/Student");
const Coordinator = require("../models/Coordinator");
const PreRecruiter = require("../models/PreRecruiter");
const Recruiter = require("../models/Recruiter");
const Image = require("../models/Image")
const PostedDrive = require("../models/PostedDrive");
const ApprovedDrive = require("../models/ApprovedDrive");
const middleware = require('../middleware/auth');
const functions = require('../middleware/functions');
const { ObjectId } = require("mongodb");
const { send } = require("process");
const fs = require("fs");
const rateLimiter = require("express-rate-limit");
const limiter = rateLimiter({ max: 500, windowMS: 2000 })
const bcrypt = require("bcrypt")
router.use(limiter);
const { addEvent, getClient, updateEvent } = require("../API/Calendar/api");
const { google } = require('googleapis');
//static  directories 
router.use(express.static(path.join(__dirname.replace("routes", ""), "views")));


//************************************ GET REQUESTS *****************************

//profile coordinator
router.get("/myprofile_coord", middleware.login_coord, (req, res, next) => {
    res.render("./coord_profile.ejs", { data: req.data });
});
//profile Recruiter
router.get("/myprofile_recr", middleware.login_recr, (req, res, next) => {
    res.render("./profile.ejs", { data: req.data });
});
//profile student
router.get("/myprofile_student", middleware.login_stud, (req, res, next) => {
    const tab = req.query.tab;
    if (!tab) {
        tab = 1;
    }
    res.render("./student_profile.ejs", { data: req.data, tab: tab });
});

const { resetPassword, sendToken } = require("./password");

router.get("/resetpass", async (req, res) => {
    const role = req.query.role;
    const token = req.query.token;
    let model, query, name;
    if (role == 'student') {
        model = Student;
        name = 1;
        query = { clg_email: req.body.email }
    } else if (role == 'coordinator') {
        model = Coordinator;
        name = 2;
        query = { email: req.body.email }
    } else if (role == 'recruiter') {
        model = Recruiter;
        name = 3;
        query = { email: req.body.email }
    } else {
        res.status(400).send("Bad Request.");
        return
    }

    await resetPassword(req, res, model, token, role);
    res.render("forgotPassword.ejs", { show: true, type: "success", msg: "Your Password has been Reset.\nNew Password is sent to you by Mail.", name: name, role: role });
})



router.post("/forgotPassword", async (req, res) => {
    const role = req.query.role;
    let model, query, name, email;
    if (role == 'student') {
        model = Student;
        name = 1;
        email = req.body.email.toLowerCase();
        query = { clg_email: req.body.email.toLowerCase() }
    } else if (role == 'coordinator') {
        model = Coordinator;
        name = 2;
        email = req.body.email.toLowerCase();
        query = { email: email }
    } else if (role == 'recruiter') {
        model = Recruiter;
        name = 3;
        email = req.body.email.toLowerCase();
        query = { email: email }
    } else {
        res.status(400).send("Bad Request.");
        return
    }

    await sendToken(req, res, model, query, role);

    res.render("forgotPassword.ejs", { show: true, type: "success", msg: "Email Sent.", name: name, role: role });
})


// Forgot passord page
router.get("/forgotPassword", (req, res) => {
    const role = req.query.role;
    if (!role) {
        res.redirect("/auth/forgotPassword?role=student");
        return
    }

    let model, name;
    if (role == 'student') {
        name = 1;
        model = Student;
    } else if (role == 'coordinator') {
        name = 2;
        model = Coordinator;
    } else if (role == 'recruiter') {
        name = 3;
        model = Recruiter;
    } else {
        res.status(400).send("Bad Request.");
        return
    }

    // sendToken(model) ;
    res.render("forgotPassword.ejs", { show: false, name: name, role: role });
})

//change password page
router.get("/changepswd_student_page", middleware.login_stud, (req, res, next) => {
    res.render("./changepswd.ejs", { data: req.data, redbox: 0, show: false, type: "danger", msg: "Incorrect Password Entered" });
});
//homepage coordinator
router.get("/home_coordinator", middleware.login_coord, async (req, res, next) => {

    if (req.data.role < 4) {
        let requests = await PreRecruiter.find({ $and: [{ "history.forwarded": req.data._id }, { "history.lastupdate": true }, { status: "pending" }] });
        let postpendings = await PostedDrive.find({ drive_declined: false, drive_approved: false });
        let drivesToHandle = await ApprovedDrive.find({ handler: ObjectId(req.data._id) });
        var frwd = []
        for (var i = req.data.role + 1; i < 4; i++) {
            (await Coordinator.find({ role: i })).map(el => {
                frwd.push({ name: el.name, id: el._id });
            })
        };

        res.render("./coord_home.ejs", { data: req.data, requests: requests, postpendings: postpendings, frwd: frwd, d2h: drivesToHandle });
    }
    else {
        res.render("./coord_home.ejs", { data: req.data });
    }

});
//homepage student
router.get("/home_student", middleware.login_stud, async (req, res, next) => {
    const date = new Date();
    const drives = await ApprovedDrive.find({
        // "requirements.cgpa": { $lte: req.data.cgpa },
        "deadline": { $gte: date }
    });

    // console.log(drives);
    res.render("./student_home.ejs", { data: req.data, drives: drives });
});
//homepage recruiter
router.get("/home_recruiter", middleware.login_recr, async (req, res, next) => {
    // const posts = (await Recruiter.find({ _id: req.data._id }, { created_drives: 1 }))[0].created_drives;
    // posted = await ApprovedDrive.find({ recruiterId: req.data._id });
    const drives = await PostedDrive.find({ recruiterId: req.data._id });
    let posted = []
    for (let i = 0; i < drives.length; i++) {
        const drive = drives[i]._doc;
        if (drive.drive_approved) {
            let data = await ApprovedDrive.findById(drive._id);
            posted.push(data._doc);
        } else if (drive.drive_declined) {
            // do nothing
        } else {
            posted.push(drive)
        }
    }

    res.render("./recruiter_home.ejs", { data: req.data, posted: posted });
});
//edit profile page student
router.get("/editpp_student", middleware.login_stud, (req, res, next) => {
    res.render("./edit_profile_student.ejs", { data: req.data, show: false, type: "success", msg: "" });
});

//posted drive detail for admin
router.get("/posted_drive_details", middleware.login_admin, async (req, res) => {
    let cmp_id = req.query.c_id;
    let cdata = await PostedDrive.find({ _id: cmp_id });
    let crdntrs = await Coordinator.find({ $or: [{ role: 2 }, { role: 3 }] });
    res.render("./posteddetails.ejs", { cdata: cdata[0], data: req.data, crdntrs: crdntrs });
})
//drive detail for student
router.get("/drive_info_stud", middleware.login_stud, async (req, res) => {
    const driveId = req.query.d_id;
    const ddetails = await ApprovedDrive.find({ _id: driveId });
    res.render("./drive_detail_stud.ejs", { data: req.data, drive: ddetails[0], show: true });
})

//drive detail for coord
router.get("/drive_info_coord", middleware.login_coord, async (req, res) => {
    const driveId = req.query.d_id;
    const ddetails = await ApprovedDrive.find({ _id: driveId });
    res.render("./drive_detail_coord.ejs", { data: req.data, drive: ddetails[0], show: false });
})

//new registration for recruiters
router.get("/new_recruiter", async (req, res) => {
    res.render("./register_recruiter.ejs", { show: true, type: "danger", msg: "MNIT Jaipur Welcomes You" });
});
// create notice page
router.get("/create_notice", middleware.login_coord, async (req, res) => {
    const checked = (await Coordinator.find({ _id: req.data._id }, { checkBox: 1, _id: 0 }))[0].checkBox;
    res.render("./createnotice.ejs", { data: req.data, showList: false, domain: "", checked: checked });
});

//redirect to jnf form
router.get("/createDrive", middleware.login_recr, (req, res) => {
    const type = req.query.type;
    if (!type) {
        return res.status(403).send("no form type given");
    }
    if (type === 'jnf')
        res.render("./jnf.ejs", { data: req.data });
    else if (type === 'inf')
        res.render("./inf.ejs", { data: req.data });
    else {
        res.status(403).send("Invalid type of form type given")
    }
})
//signout
router.get("/signout", async (req, res) => {
    req.session.destroy();
    res.redirect("/");
});


// Manage Drive Coordinator

router.get("/manage_drive", middleware.login_coord, async (req, res) => {
    const driveId = req.query.d_id;
    const ddetails = await ApprovedDrive.find({ _id: driveId });
    if (ddetails.length === 0) {
        res.statusCode(400);
        return
    }
    res.render("./manage_drive.ejs", { data: req.data, drive: ddetails[0] });
});

// Add Event in Drive

function addHours(numOfHours, date = new Date()) {
    date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

    return date.toISOString();
}

router.post("/add_drive_event", middleware.login_coord, async (req, res) => {
    if (!req.body.id) {
        res.statusCode(400);
        return
    }
    const data = req.body;
    const drive = await ApprovedDrive.findById(data.id);


    let round = {
        roundNo: drive.rounds.length + 1,
        roundName: data.roundName,
        announced: false,
        sortlistedCandidates: [],
        timeSlot: data.datetime,
        duration: data.duration
    }


    const auth = await getClient();
    const start_time = new Date(data.datetime).toISOString();
    const end_time = addHours(round.duration / 60, new Date(data.datetime));
    const event_id = await addEvent(auth, start_time, end_time, drive.companyName, round.roundName);
    // console.log(event_id);
    if (!event_id) {
        res.statusCode(400);
    }

    drive.rounds.push(round);
    drive.rounds[drive.rounds.length - 1].eventID = event_id;

    const ans = await ApprovedDrive.updateOne({ _id: data.id }, drive);
    if (ans.acknowledged && event_id) {
        res.redirect("/auth/manage_drive?d_id=" + data.id)
        return
    }
    res.statusCode(400);
})


router.post("/edit_drive_event", middleware.login_coord, async (req, res) => {
    if (!req.body.id) {
        res.statusCode(400);
        return
    }
    const data = req.body;
    const drive = await ApprovedDrive.findById(data.id);

    const round = {
        roundNo: data.roundNo,
        roundName: data.roundName,
        announced: false,
        sortlistedCandidates: [],
        timeSlot: data.datetime,
        duration: data.duration
    }


    const auth = await getClient();

    const start_time = new Date(data.datetime).toISOString();
    const end_time = addHours(round.duration / 60, new Date(data.datetime));

    const event_id = await updateEvent(auth, drive.rounds[drive.rounds.length - 1].eventID, start_time, end_time, drive.companyName, round.roundName);
    // console.log(event_id);
    if (!event_id) {
        res.statusCode(400);
    }
    drive.rounds[data.roundNo - 1] = round;
    drive.rounds[drive.rounds.length - 1].eventID = event_id;

    const ans = await ApprovedDrive.updateOne({ _id: data.id }, drive); // returns status code of req

    if (ans.acknowledged) {
        res.redirect("/auth/manage_drive?d_id=" + data.id)
        return
    }
    res.statusCode(400);
});



// Show Drive Timeline Recruiter

router.get("/show_timeline", middleware.login_recr, async (req, res) => {
    const driveId = req.query.d_id;
    const ddetails = await ApprovedDrive.find({ _id: driveId });
    if (ddetails.length === 0 || ddetails[0].recruiterId !== String(req.data._id)) {
        res.status(400).send("Unauthorized");
        return
    }
    res.render("./view_timeline_rec.ejs", { data: req.data, drive: ddetails[0] });
})



// updating notification read status
router.get("/changeReadStatus", async (req, res) => {
    let msgid = req.query.mid;
    let e_id = req.query.sid;
    let role = req.query.role;
    if (role === "stud") {
        const prevstatus = (await Student.findOne({ student_id: e_id, "inbox._id": ObjectId(msgid) })).inbox.find(o => o._id == msgid);
        if (prevstatus.readstatus)
            await Student.findOneAndUpdate({ student_id: e_id, "inbox._id": ObjectId(msgid) }, {
                $set: {
                    "inbox.$.readstatus": false
                }
            });
        else
            await Student.findOneAndUpdate({ student_id: e_id, "inbox._id": ObjectId(msgid) }, {
                $set: {
                    "inbox.$.readstatus": true
                }
            });
        res.redirect("/auth/notifications_stud")
    }
    else if (role === "coord") {
        const prevstatus = (await Coordinator.findOne({ email: e_id, "inbox._id": ObjectId(msgid) })).inbox.find(o => o._id == msgid);
        if (prevstatus.readstatus)
            await Coordinator.findOneAndUpdate({ email: e_id, "inbox._id": ObjectId(msgid) }, {
                $set: {
                    "inbox.$.readstatus": false
                }
            });
        else
            await Coordinator.findOneAndUpdate({ email: e_id, "inbox._id": ObjectId(msgid) }, {
                $set: {
                    "inbox.$.readstatus": true
                }
            });
        res.redirect("/auth/notifications_coord");
    }

})
//notifications student
router.get("/notifications_stud", middleware.login_stud, (req, res) => {
    res.render("./notifications.ejs", { data: req.data, sid: req.data.student_id });
})
//notifications Coordinator
router.get("/notifications_coord", middleware.login_coord, async (req, res) => {
    res.render("./notifications.ejs", { data: req.data, sid: req.data.email });
})
//notifications Recruiter
router.get("/notifications_recr", middleware.login_recr, async (req, res) => {
    res.render("./notificationsRecr.ejs", { data: req.data, sid: req.data.email });
})
// list of applied students
router.get("/getlist_applied", middleware.login_coord, async (req, res) => {
    let id = req.query.id;
    var students = []
    const driveData = (await ApprovedDrive.find({ _id: id }))[0];
    const ids = driveData.applied;

    for (var i = 0; i < ids.length; i++) {
        const sdata = (await Student.find({ _id: ObjectId(ids[i].candidateId) }, { first_name: 1, last_name: 1, branch: 1, cgpa: 1, mobile: 1, student_id: 1 }))[0];
        if (sdata) {
            sdata.status = ids[i].status;
            students.push(sdata);
        }
    }
    const dd = { c_name: driveData.companyName, c_id: id, logo: driveData.logo, process: driveData.process }
    res.render("./appliedStud.ejs", { data: req.data, students: students, dd: dd });
});

//********************************* POST REQUESTS ********************************

//post notice
router.post("/post_notice", middleware.login_coord, async (req, res) => {
    sending_time = new Date();
    const msg = { date: new Date(), title: req.body.title, body: req.body.message, from: { name: req.data.name, id: req.data.email, domain: "auth/showCoordinators" } };
    try {
        const scope = (await Coordinator.find({ _id: req.data._id }, { checkBox: 1, _id: 0 }))[0].checkBox;
        console.log(scope)
        scope.forEach(element => {
            functions.sendmsg(element, msg);
        });
        await Coordinator.updateOne({ _id: req.data._id }, {
            $set: { checkBox: [] }
        })
    }
    catch (err) {
        return res.send(err);
    }
    res.redirect("/auth/create_notice")
})

// new request from recruiter for thr approval
router.post("/recruiter_request", async (req, res) => {
    let name = req.body.name;
    let email = req.body.email.trim();
    let mobile = req.body.mobile;
    let policyAccept = req.body.policies;
    if (!policyAccept) {
        return res.render("./register_recruiter.ejs", { show: true, type: "danger", msg: "You must agree to our policies" });
    }
    const validity = await functions.isEmailValid(email);
    if (validity) {
        if ((await Recruiter.find({ email: email })).length === 1) {
            res.render("./register_recruiter.ejs", { show: true, type: "danger", msg: "You are already registered. Please Sign in" });
        }
        else if ((await PreRecruiter.find({ email: email })).length === 0) {
            const newRec = new PreRecruiter({
                company_name: name,
                email: email,
                mobile: mobile,
                orgType: req.body.orgType,
                msg: req.body.msg,
                status: "pending",
                history: [{ status: "pending", forwarded: '62bff8eacf844bd06d7818a5', lastupdate: true }]
            });
            try {
                await newRec.save();
                res.render("./register_recruiter.ejs", { show: true, type: "success", msg: "Data Submitted. We will contact you soon" });
            }
            catch {
                res.render("./register_recruiter.ejs", { show: true, type: "danger", msg: "Something went wrong. Please Try again" });
            }
        }
        else {
            res.render("./register_recruiter.ejs", { show: true, type: "danger", msg: "Your request is already in process.Please keep patience" });
        }

    }
    else {
        res.render("./register_recruiter.ejs", { show: true, type: "danger", msg: "Entered email is not valid" });
    }

});

// Recruiter posting a new drive

router.post("/postDrive", middleware.login_recr, async (req, res) => {


    function checkBinaryInput(inp) {
        if (typeof inp !== 'undefined' && inp === 'on') {
            return true
        }
        return false
    }

    if (req.data.drivesCount < 5) {
        let workLocations = []
        const len = req.body.country.length;
        if (len) {
            for (var i = 0; i < req.body.country.length; i++) {
                workLocations.push({ country: req.body.country[i], state: req.body.state[i], city: req.body.city[i] })
            }
        }
        const newDrive = {
            recruiterId: req.data._id,
            driveType: req.body.driveType,
            companyName: req.data.company_name,
            // website: req.body.website,
            // orgType: req.body.orgType,
            // industrySector: req.body.inSec,
            jobDesig: req.body.jobDes,
            jobDesc: req.body.jobDesc,
            joiningDate: req.body.joinDate,
            package: req.body.package,
            postedDate: new Date,
            workLocations: workLocations,
            branches: req.body.branch,
            positions: req.body.position,
            requirements: { cgpa: req.body.cgreq, medical: req.body.medreq, others: req.body.otherreq },
            visitDate: req.body.prefDate,
            executivesVisiting: req.body.noexe,
            roomsRequired: req.body.rooms,
            process: {
                prePlacementTalk: { req: checkBinaryInput(req.body.placetalk) },
                TechnicalPresentation: { req: checkBinaryInput(req.body.tec) },
                apptitudeTest: { req: checkBinaryInput(req.body.apt) },
                gd: { req: checkBinaryInput(req.body.gd) },
                personalInterview: { req: checkBinaryInput(req.body.pi) },
                waitlistProvosion: { req: checkBinaryInput(req.body.pfw) },
                finalOffer: { announcedOn: req.body.final }
            },
            contact: {
                personName: req.body.conper,
                email: req.body.email,
                address: req.body.coadd,
                mobile: req.body.mobile,
                phone: req.body.phone,
                fax: req.body.fax
            }
        };

        const newd = new PostedDrive(newDrive);
        try {
            const drive = await newd.save();
            await Recruiter.updateOne({ _id: ObjectId(req.data._id) }, {
                $push: {
                    created_drives: { driveId: drive._id }
                },
                $inc: {
                    drivesCount: 1
                }
            });
            res.redirect("home_recruiter")
        }
        catch (err) {
            res.send("Error:" + err)
        }
    }
    else {
        res.send("You have exceeded the limit of posting drives");
    }
})

// approve recruiter
router.get("/approve_recruiter", middleware.login_coord, async (req, res) => {
    let id = req.query.id;
    var v_d = (await PreRecruiter.find({ _id: id }))[0];
    const salt = await bcrypt.genSalt(10);
    const email = v_d.email;
    const subject = "Request Approved"
    const tempp = Math.random().toString(36).slice(-8);
    const password = await bcrypt.hash(tempp, salt);
    const new_recruiter = new Recruiter({ email: v_d.email, company_name: v_d.company_name, password: password, mobile: v_d.mobile });
    try {
        await new_recruiter.save();
        await PreRecruiter.updateOne({ _id: id }, {
            $set: { status: "approved", takenBy: req.data.id, takenAt: new Date() }
        });

        let body = `Hi ${v_d.company_name}, <br>
        Your registration request on the Placement Portal has been approved. <br><br>
        We are delighted that you will be hiring at our university. You may Login to the Placement Portal with the following credentials : <br>

        WEBSITE : <a href="https://placements.mnit.ac.in/" >Placements MNIT</a> <br>
        EMAIL : ${email} <br>
        PASSWORD : ${tempp} <br>

        Thanks,<br>
        Placement & Training Cell<br>
        MNIT Jaipur <br>

        `

        await sendEmail(email, subject, body);
        res.redirect("/auth/home_coordinator");
        // fs.readFile(`${__dirname.replace("routes", "assets")}\\approvedRec.html`, (err, result) => {
        //     if (err) throw err;
        //     else {

        //     }
        // })
    }
    catch (err) {
        res.send("Something happened wrong. Please Try again");
        console.log(err);

    }
})
// deny recruiter
router.get("/deny_recruiter", middleware.login_coord, async (req, res) => {
    let id = req.query.id;
    await PreRecruiter.deleteOne({ _id: id });
    res.redirect("/auth/home_coordinator")
});


router.get("/check_company", middleware.login_stud, async (req, res) => {
    let id = req.query.d_id;
    // console.log(req.data);
    const company_req = await ApprovedDrive.findById({ _id: id }, { requirements: 1 });
    if (company_req.length === 0) {
        res.status(400).send("Invalid Request.");
        return
    }

    if (req.data.cgpa < company_req.requirements.cgpa) {
        res.status(400).send("Your CGPA is less than required CGPA.");
        return
    } else if (req.data.got_internship || req.data.placed) {
        res.status(400).send("You have already been Placed..");
        return
    } else {
        res.status(200).send("You can Apply.")
    }
});

//apply for a drive
router.get("/apply_drive", middleware.login_stud, async (req, res) => {
    let id = req.query.d_id;
    // console.log(req.data);
    const company_req = await ApprovedDrive.findById({ _id: id }, { requirements: 1 });
    if (company_req.length === 0) {
        res.statusCode(404);
        return
    }

    if (req.data.cgpa < company_req.requirements.cgpa) {
        res.send("Your CGPA is less than required CGPA.");
        return
    } else if (req.data.got_internship || req.data.placed) {
        res.send("You have already been Placed..");
        return
    } else {
        await ApprovedDrive.findOneAndUpdate({ _id: id }, {
            $push: { applied: { candidateId: req.data._id } }
        });
        await Student.findOneAndUpdate({ _id: req.data._id }, {
            $push: { appliedIn: { driveId: id, status: "pending" } }
        });
        res.redirect("/auth/home_student");
    }
});

//forward recruiter request
router.post("/frwd_request", middleware.login_coord, async (req, res) => {
    let id = req.query.d_id;
    let frwdto = req.body.frwdto;
    let note = req.body.note;
    await PreRecruiter.updateOne({ $and: [{ _id: id }, { "history.status": "pending" }, { "history.forwarded": req.data._id }, { "history.lastupdate": true }] }, {
        $set: { "history.$.status": "forwarded" },
    })
    await PreRecruiter.updateMany({ _id: id },
        { $set: { "history.$[elem].lastupdate": false } },
        { arrayFilters: [{ $and: [{ "elem.forwarded": frwdto }, { "elem.lastupdate": true }] }] });
    await PreRecruiter.findOneAndUpdate({ _id: id }, {
        $push: { history: { status: "pending", forwarded: frwdto, time: new Date(), note: note, sender: req.data._id } }
    })
    res.redirect("/auth/home_coordinator");
});


// fetch profile photo student
router.get("/public/images/:name", middleware.login_stud, middleware.check_dir, async (req, res) => {
    const name = req.params.name;
    try {
        if (fs.existsSync(path.join(__dirname.replace("routes", "public"), `/images/${req.data._id}/`) + name)) {
            res.sendFile(path.join(__dirname.replace("routes", "public"), `/images/${req.data._id}/`) + name);
        }
        else {
            res.send("bad request");
        }
    } catch (err) {
        console.error(err);
    }
});
//get Profile image of a Student for coordinator 
router.get("/public/images/stud/:id", middleware.login_coord, middleware.check_dir, async (req, res) => {
    const id = req.params.id;
    const stud = await Student.find({ _id: id });
    if (stud.length === 1) {

        try {
            if (fs.existsSync(path.join(__dirname.replace("routes", "public"), `/images/${stud[0]._id}/`) + stud[0].profile_image)) {
                res.sendFile(path.join(__dirname.replace("routes", "public"), `/images/${stud[0]._id}/`) + stud[0].profile_image);
            }
            else {
                res.send("bad request");
            }
        } catch (err) {
            console.error(err);
        }
    }
    else {
        res.send("bad request");
    }
});
router.post("/verifyStud", middleware.login_coord, async (req, res) => {
    const id = req.body.id.trim();
    const sid = req.body.sid.trim();
    const value = req.body.request.trim();
    await ApprovedDrive.findOneAndUpdate({ _id: id, "applied.candidateId": sid }, {
        $set: { "applied.$.status": value }
    });
    res.redirect(`/auth/getlist_applied?id=${id}`);

})
router.get("/myquery", async (req, res) => {
    // const arr = await Coordinator.find({});
    // const salt = await bcrypt.genSalt(10);
    // const password = await bcrypt.hash('1133', salt);
    // arr.map(async (el) => {
    //     await Coordinator.findOneAndUpdate({ _id: el._id }, {
    //         password: password
    //     })
    // })
    // const email = "vishnumali3911@gmail.com"
    // const subject = "Approved"
    // fs.readFile(`${__dirname.replace("routes", "assets")}\\approvedRec.html`, (err, result) => {
    //     if (err) throw err;
    //     else {
    //         functions.mail(email, subject, result.replace("{password}",));
    //         res.send('sent');
    //     }
    // })
    await Query.deleteMany({});
    // res.send((await Feedback.find({})));


});

//seting search scope of entity
router.post("/selectScope", middleware.login_coord, async (req, res) => {
    const scope = req.body.scope;
    if (!scope) {
        res.status(403).send("forbidden");
        return
    }
    var data = []
    if (scope === "3ywg7632gewp") {
        res.redirect("/auth/showStudents?page=1");
    }
    else if (scope === "3477wgjwyhew") {
        res.redirect("/auth/showRecruiters?page=1");
    }
    else if (scope === "376gwyug672g") {
        res.redirect("/auth/showCoordinators?page=1");
    }
    else {
        res.status(403).send("Invalid Scope");
    }
})
//Fetch table of all Students
router.get("/showStudents", middleware.login_coord, async (req, res) => {
    var perPage = 5;
    var page = req.query.page || 1;
    const checked = (await Coordinator.find({ _id: req.data._id }, { checkBox: 1, _id: 0 }))[0].checkBox;
    Student.find({}, { c1: '$student_id', c2: { $concat: ['$first_name', ' ', '$last_name'] }, c3: "$branch" })
        .skip((perPage * page) - perPage)
        .limit(perPage).exec(function (err, data) {
            if (err) throw err;
            Student.countDocuments({}).exec((err, count) => {
                res.render("./createnotice.ejs", {
                    checked: checked,
                    data: req.data,
                    scopeList: data,
                    showList: true,
                    domain: "auth/showStudents",
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            })
        })
})
//Fetch table of all Recruiters
router.get("/showRecruiters", middleware.login_coord, async (req, res) => {
    var perPage = 5;
    var page = req.query.page || 1;
    const checked = (await Coordinator.find({ _id: req.data._id }, { checkBox: 1, _id: 0 }))[0].checkBox;
    Recruiter.find({}, { c2: "$company_name", c1: "$email", c3: "$mobile" })
        .skip((perPage * page) - perPage)
        .limit(perPage).exec(function (err, data) {
            if (err) throw err;
            Recruiter.countDocuments({}).exec((err, count) => {
                res.render("./createnotice.ejs", {
                    data: req.data,
                    scopeList: data,
                    checked: checked,
                    showList: true,
                    domain: "auth/showRecruiters",
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            })
        })
})
//Fetch table of all Coordinators
router.get("/showCoordinators", middleware.login_coord, async (req, res) => {
    var perPage = 5;
    var page = req.query.page || 1;
    const checked = (await Coordinator.find({ _id: req.data._id }, { checkBox: 1, _id: 0 }))[0].checkBox;
    Coordinator.find({}, { c2: '$name', c3: '$position', c1: '$email' })
        .skip((perPage * page) - perPage)
        .limit(perPage).exec(function (err, data) {
            if (err) throw err;
            Coordinator.countDocuments({}).exec((err, count) => {
                res.render("./createnotice.ejs", {
                    data: req.data,
                    scopeList: data,
                    checked: checked,
                    showList: true,
                    domain: "auth/showCoordinators",
                    current: page,
                    pages: Math.ceil(count / perPage)
                });

            })
        })
})
//Serch a entity to send message 
router.post("/searchEntry", middleware.login_coord, async (req, res) => {
    const text = req.body.searchValue;
    if (!text || !req.query.searchIn || req.query.searchIn.split("/").length !== 2) {
        res.status(403).send("forbidden");
    }
    const domain = req.query.searchIn.split("/")[1];
    var data = [];
    if (domain === 'showStudents') {
        data = await Student.find({ student_id: text }, { c1: '$student_id', c2: { $concat: ['$first_name', ' ', '$last_name'] }, c3: "$branch" })
    }
    else if (domain === 'showRecruiters') {
        data = await Recruiter.find({ email: text }, { c2: "$company_name", c1: "$email", c3: "$mobile" })
    }
    else if (domain === 'showCoordinators') {
        data = await Coordinator.find({ email: text }, { c2: '$name', c3: '$position', c1: '$email' })
    }
    else {
        res.status(403).send("forbidden");
    }
    const checked = (await Coordinator.find({ _id: req.data._id }, { checkBox: 1, _id: 0 }))[0].checkBox;
    res.render("./createnotice.ejs", {
        data: req.data,
        scopeList: data,
        showList: true,
        checked: checked,
        domain: `auth/${domain}`,
        current: 1,
        pages: 1
    });
})
//Add an entry to reciepient list
router.post('/chooseCandidate', middleware.login_coord, async (req, res) => {
    const id = req.query.id;
    const domain = req.query.domain;
    if (!id || !domain || !req.body.select === undefined) {
        return res.status(403).send("forbidden : Id  not found");
    }
    if (req.body.select == "on") {
        try {
            await Coordinator.updateOne({ _id: req.data._id }, {
                $push: { checkBox: { id: id, domain: domain } }
            });
            res.redirect('/auth/create_notice');
        }
        catch (err) {
            res.send("error");
            console.log(err);
        }
    }
    else {
        try {
            await Coordinator.updateOne({ _id: req.data._id }, {
                $pull: { checkBox: { id: id } }
            });
            res.redirect('/auth/create_notice');
        }
        catch (err) {
            res.sendStatus(404);
            console.log(err);
        }
    }
})

//remove an entry from reciepient list 
router.get("/removeEntry", middleware.login_coord, async (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.status(401).send("Entry not exist to remove");
    }
    try {
        await Coordinator.updateOne({ _id: req.data._id }, {
            $pull: { checkBox: { id: id } }
        });
        res.redirect('/auth/create_notice');
    }
    catch (err) {
        res.sendStatus(404);
        console.log(err);
    }
})
//forward request to message sending page
router.get("/replyMsg", middleware.login_recr, async (req, res) => {
    const to = req.query.to;
    const msg = req.query.for;
    const domain = req.query.domain;

    if (!to || !msg || !domain) {
        return res.status(404), send("Message Not found");
    }
    await Recruiter.updateOne({ _id: req.data._id }, {
        $set: { checkBox: [{ id: to, domain: domain }] }
    });
    res.redirect("/auth/msgPage");

})

// open message sending page for recruiter
router.get("/msgPage", middleware.login_recr, async (req, res) => {
    const to = await Recruiter.find({ _id: req.data.id }, { checkBox: 1, _id: 0 })
    if (to.length === 1) {
        const target = to[0].checkBox;
        if (target.length == 1) {
            try {
                res.render("./message", { data: req.data, checked: { id: target[0].id, domain: target[0].domain } })
            }
            catch (err) {
                return res.send("Some internal error");
            }
        }
        else {
            return res.send("Some internal error");
        }
    }
    else { return res.send("Some internal error"); }
})

//send message by recruiter to coordinator only
router.post("/message", middleware.login_recr, async (req, res) => {
    sending_time = new Date();
    const msg = { date: new Date(), title: req.body.title, body: req.body.message, from: { name: req.data.company_name, id: req.data.email, domain: "auth/showRecruiters" } };
    try {
        const sendTo = (await Recruiter.find({ _id: req.data._id }, { checkBox: 1, _id: 0 }))[0].checkBox[0];

        functions.sendmsg(sendTo, msg);

        await Recruiter.updateOne({ _id: req.data._id }, {
            $set: { checkBox: [] }
        })
        res.redirect('/auth/home_recruiter');
    }
    catch (err) {
        return res.sendStatus(404);
        console.log(err);
    }
})
const Feedback = require('../models/Feedback')
const Query = require('../models/query');
const { sendEmail } = require("../API/Mail/mail");
router.post("/giveFeedback", middleware.login_recr, async (req, res) => {
    let tempRes = await Feedback.find({ recruiterId: req.data._id });
    if (tempRes.length === 0) {
        try {
            const feed = new Feedback({ recruiterId: req.data._id, feed: [{ feedmsg: req.body.feed, rating: parseInt(req.body.rating) }], filled: true });
            await feed.save();
            res.redirect("/auth/home_recruiter")
        }
        catch (err) {
            res.send("Some error");
            console.log(err);
        }
    }
    else if (tempRes.length === 1) {
        try {
            await Feedback.updateOne({ recruiterId: req.data._id }, {
                $push: { feed: { feedmsg: req.body.feed, rating: parseInt(req.body.rating) } }
            })
            res.redirect("/auth/home_recruiter")
        }
        catch (err) {
            res.send("Some error");
            console.log(err);
        }
    }
    else {
        res.send("Some error");
    }
})
router.post("/raiseQuery", middleware.login_recr, async (req, res) => {
    let tempRes = await Query.find({ recruiterId: req.data._id });
    if (tempRes.length === 0) {
        try {
            const query = new Query({ recruiterId: req.data._id, query: [{ title: req.body.qtitle, querymsg: req.body.qdetail }] });
            await query.save();
            res.redirect("/auth/home_recruiter")
        }
        catch (err) {
            res.send("Some error");
            console.log(err);
        }
    }
    else if (tempRes.length === 1) {
        try {
            await Query.updateOne({ recruiterId: req.data._id }, {
                $push: { query: { title: req.body.qtitle, querymsg: req.body.qdetail } }
            });
            res.redirect("/auth/home_recruiter")
        }
        catch (err) {
            res.send("Some error");
            console.log(err);
        }
    }
    else {
        res.send("Some error");
    }

})
module.exports = router;