const express = require("express");
const functions = require('../middleware/functions');
const router = express.Router();
const Student = require("../models/Student");
const Coordinator = require("../models/Coordinator");
const Recruiter = require("../models/Recruiter");
const path = require('path');
const rateLimiter = require("express-rate-limit");
const limiter = rateLimiter({ max: 500, windowMS: 2000 })
const bcrypt = require("bcrypt");
const { sendEmail } = require("../API/Mail/mail");
router.use(limiter);

router.use(express.static(path.join(__dirname.replace("routes", ""), "views")));

router.get("/registration", async (req, res) => {
    res.render("registration",{path: req.originalUrl,})
})
router.post("/newRegistration", async (req, res) => {
    const data = req.body;
    let newpswd = Math.random().toString(36).slice(-8);

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(newpswd, salt);

    const new_s = new Student({
        "first_name": data.fname,
        "last_name": data.lname,
        "student_id": data.sid.toLowerCase(),
        "branch": data.branch,
        "password": password,
        "backlogs": "0",
        "cgpa": data.cgpa,
        "clg_email": data.sid.toLowerCase() + "@mnit.ac.in",
        "curr_sem": data.semester,
        "dob": data.dob,
        "mobile": data.mobile,
        "nationality": "Indian",
        "programme": data.prog,
        "sec_email": data.email,
        "gender": data.gender,
        "addmission_year": data.admYear
    });

    let body = `Hi ${data.fname}, <br>
    Your account has been created on the Placement Portal of MNIT Jaipur. <br><br>
    You may Login to the Placement Portal with the following credentials : <br>

    WEBSITE : <a href="https://placements.mnit.ac.in/" >Placements MNIT</a> <br>
    EMAIL : ${data.sid} <br>
    PASSWORD : ${newpswd} <br>

    Thanks,<br>
    Placement & Training Cell<br>
    MNIT Jaipur <br>
`;

    try {
        await new_s.save();
        sendEmail(data.sid.toLowerCase() + "@mnit.ac.in", "New Account Created", body);
        res.render("./Login.ejs", {
            name: 1,
            show: true,
            type: "success",
            msg: "Check your email for further information",
        });
    }
    catch (err) {
        res.status(401).render("error.ejs", { path: req.originalUrl, error: { code: 401, message: "Sorry, Some Internal Server Problem .Please Try again later" }, auth: { isAuth: req.session.isAuth, role: role } })
        console.log(err);
    }
});

give_time2 = function (a) {
    let curr = new Date().getTime(); let difference = Math.floor(a.getTime() / 1000) - Math.floor(curr
        / 1000); if (difference < 60) { output = `${difference} seconds `; } else if (difference < 3600) {
            output = `${Math.floor(difference / 60)} minutes `;
        } else if (difference < 86400) {
            output = `${Math.floor(difference /
                3600)} hours `;
        } else { output = `${Math.floor(difference / 86400)} days `; }
    return output;
}

//login Student
router.post("/loginHandler_student", async (req, res) => {
    let student_id = req.body.student_id.trim().toLowerCase();
    let password = req.body.password.trim();
    let student = await Student.find({ student_id: student_id });
    if (student.length === 0) {
        res.render("./Login.ejs", { name: 1, show: true, type: "danger", msg: "Student not found" });
    }
    else if (student.length > 1) {
        res.render("./Login.ejs", { name: 1, show: true, type: "danger", msg: "Something happened which should not be" });
        //REPORT TO ADMIN
    }
    else {
        const data = student[0];
        if (await bcrypt.compare(password, data.password)) {
            if (data.flaggedUntil > Date.now()) {
                res.render("./Login.ejs", { name: 1, show: true, type: "danger", msg: "You have been flagged. You can login after " + give_time2(data.flaggedUntil) });
                return;
            }
            let token = functions.generateToken();
            req.session.isAuth = true;
            req.session.role = 'student';
            req.session.student_id = data.student_id;
            req.session.token = token;
            await Student.updateOne({ student_id: student_id }, {
                $set: { temp_token: token }
            });
            res.redirect("/auth/home_student");
        }
        else {
            res.render("./Login.ejs", { name: 1, show: true, type: "danger", msg: "Incorrect Password" });
        }
    }
})

//Login Coordinator
router.post("/loginHandler_coordinator", async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let toremember = 'off';
    let coordinator = await Coordinator.find({ email: email });
    if (coordinator.length === 0) {
        res.render("./Login.ejs", { name: 2, show: true, type: "danger", msg: "Account not found" });
    }
    else if (coordinator.length > 1) {
        res.render("./Login.ejs", { name: 2, show: true, type: "danger", msg: "Something happened which should not be" });
        //REPORT TO ADMIN
    }
    else {
        const data = coordinator[0];
        if (await bcrypt.compare(password, data.password)) {
            let token = functions.generateToken();
            req.session.isAuth = true;
            req.session.role = data.position;
            req.session.email = data.email;
            req.session.token = token;
            await Coordinator.updateOne({ email: email }, {
                $set: { temp_token: token }
            });
            res.redirect("/auth/home_coordinator");
        }
        else {
            res.render("./Login.ejs", { name: 2, show: true, type: "danger", msg: "Incorrect Password" });
        }
    }
})

//Login Recruiter
router.post("/loginHandler_recruiter", async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let toremember = 'off';
    let recruiter = await Recruiter.find({ email: email });
    if (recruiter.length === 0) {
        res.render("./Login.ejs", { name: 3, show: true, type: "danger", msg: "Account not found" });
    }
    else if (recruiter.length > 1) {
        res.render("./Login.ejs", { name: 1, show: true, type: "danger", msg: "Something happened which should not be" });
        //REPORT TO ADMIN
    }
    else {
        const data = recruiter[0];
        if (await bcrypt.compare(password, data.password)) {
            let token = functions.generateToken();
            req.session.isAuth = true;
            req.session.role = 'recruiter';
            req.session.email = data.email;
            req.session.token = token;
            await Recruiter.updateOne({ email: email }, {
                $set: { temp_token: token }
            });
            res.redirect("/auth/home_recruiter");
        }
        else {
            res.render("./Login.ejs", { name: 1, show: true, type: "danger", msg: "Incorrect Password" });
        }
    }
});
module.exports = router;
