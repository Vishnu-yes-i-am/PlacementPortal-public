const express = require("express");
const router = express.Router();
const path = require("path");
const functions = require('../middleware/functions');
const Student = require("../models/Student");
const middleware = require('../middleware/auth');
const { ObjectId } = require("mongodb");
const fs = require("fs");
const sharp = require('sharp');
const rateLimiter = require("express-rate-limit");
const limiter = rateLimiter({ max: 500, windowMS: 2000 })
const bcrypt = require('bcrypt');
router.use(limiter);

//static files 
router.use(express.static(path.join(__dirname.replace("routes", ""), "views")));
//add skills
router.post("/add_skill", middleware.login_stud, async (req, res) => {
    const type = req.query.type;
    const skill = req.body.skill;
    const s = JSON.stringify(`skills.${type}`);
    if (req.data) {
        const id = req.data._id;
        if (type === "languages") {
            await Student.updateOne({ _id: ObjectId(id) }, {
                $push: { "skills.languages": skill }
            });
        }
        else if (type === "technologies") {
            await Student.updateOne({ _id: ObjectId(id) }, {
                $push: { "skills.technologies": skill }
            });
        }
        else if (type === "database") {
            await Student.updateOne({ _id: ObjectId(id) }, {
                $push: { "skills.database": skill }
            });
        }
    }
    res.redirect('/auth/myprofile_student?tab=3');

})
//update academic details of 12th
router.post("/update_acad12", middleware.login_stud, async (req, res) => {
    await Student.updateOne({ _id: req.data.id }, {
        $set: { "education.s12.school_name": req.body.school_name12, "education.s12.address": req.body.school_address12, "education.s12.percentage": req.body.school_perc12, "education.s12.passing_year": req.body.acad_year12, "education.s12.board": req.body.school_board12, "education.s12.saved": true }
    })
    res.redirect("/auth/myprofile_student?tab=2")
});
//update academic details of 10th
router.post("/update_acad10", middleware.login_stud, async (req, res) => {
    await Student.updateOne({ _id: req.data.id }, {
        $set: { "education.s10.school_name": req.body.school_name10, "education.s10.address": req.body.school_address10, "education.s10.percentage": req.body.school_perc10, "education.s10.passing_year": req.body.acad_year10, "education.s10.board": req.body.school_board10, "education.s10.saved": true }
    })
    res.redirect("/auth/myprofile_student?tab=2")
});
//Add a project to resume
router.post("/add_project", middleware.login_stud, async (req, res) => {
    const title = req.body.title;
    const techUsed = req.body.techUsed;
    const link = req.body.link;
    const desc = req.body.desc;
    await Student.updateOne({ _id: req.data.id }, {
        $push: { projects: { title: title.trim(), techUsed: techUsed.trim(), link: link.trim(), desc: desc.trim() } }
    })
    res.redirect("/auth/myprofile_student?tab=3")
});

//Add a experience to resume
router.post("/add_experience", middleware.login_stud, async (req, res) => {
    const role = req.body.role;
    const org = req.body.org;
    const startDate = req.body.startDate;
    const desc = req.body.desc;
    const duration = req.body.duration;

    await Student.updateOne({ _id: req.data.id }, {
        $push: { experiences: { role: role.trim(), organisation: org.trim(), startDate: startDate, desc: desc.trim(), duration: duration } }
    })
    res.redirect("/auth/myprofile_student?tab=3")
});

//Remove a project from resume
router.get("/remove_project", middleware.login_stud, async (req, res) => {
    await Student.updateOne({ _id: req.data.id }, {
        $pull: { projects: { _id: req.query.id } }
    })
    res.redirect("/auth/myprofile_student?tab=3")
});

//Remove a experience
router.get("/remove_experience", middleware.login_stud, async (req, res) => {
    await Student.updateOne({ _id: req.data.id }, {
        $pull: { experiences: { _id: req.query.id } }
    })
    res.redirect("/auth/myprofile_student?tab=3")
});

//Remove a skill 
router.get("/remove_skill", middleware.login_stud, async (req, res) => {
    const id = req.data._id;
    const type = req.query.type;
    const skill = req.query.skill;
    if (type === "languages") {
        await Student.updateOne({ _id: ObjectId(id) }, {
            $pull: { "skills.languages": skill }
        });
    }
    else if (type === "technologies") {
        await Student.updateOne({ _id: ObjectId(id) }, {
            $pull: { "skills.technologies": skill }
        });
    }
    else if (type === "database") {
        await Student.updateOne({ _id: ObjectId(id) }, {
            $pull: { "skills.database": skill }
        });
    }
    res.redirect("/auth/myprofile_student?tab=3")
});
const chomu = functions.upload.single("pphoto");
//update profile photo student


router.post("/update_pphoto", middleware.login_stud, (req, res, next) => {
    chomu(req, res, function (err) {
        if (err) {
            return res.status(400).send({ message: err.message })
        }
        next()
    })
}
    , async (req, res) => {
        const name = req.file.filename.trim();
        const path = req.file.path.trim();
        const dest = req.file.destination.trim();

        const predata = await Student.findOneAndUpdate({ _id: req.data._id }, {
            $set: { profile_image: name }
        });
        sharp(path)
            .resize(200, 200)
            .jpeg({ quality: 90 })
            .toFile(dest.replace("uploads", "images/") + `${req.data._id}/` + name, (err) => {
                if (err)
                    res.status(403).send("Error in compression");
                if (fs.existsSync(dest.replace("uploads", "images/") + `${req.data._id}/` + predata.profile_image)) {
                    fs.unlinkSync(dest.replace("uploads", "images/") + `${req.data._id}/` + predata.profile_image)
                }
                res.redirect("/auth/editpp_student");
                fs.unlinkSync(req.file.path);
            })
    })
//Update github and linkedIn link 
router.post("/updateLink", middleware.login_stud, async (req, res) => {
    const gl = req.body.glink;
    const ll = req.body.llink;
    if (gl && ll) {
        await Student.updateOne({ _id: req.data.id }, {
            $set: { github: gl, linkedIn: ll }
        })
        res.redirect("/auth/myprofile_student?tab=3");
    }
    else {
        res.status(403).send("Invalid Request");
    }

});
// edit profile Students
router.post("/editprofile_student", middleware.login_stud, async (req, res) => {
    let new_email = req.body.email;
    let new_mobile = req.body.mobile;
    let msg = "nothing changed";
    if (new_email !== req.data.sec_email) {
        if ((await functions.isEmailValid(new_email))) {
            let result = await Student.updateOne({ student_id: req.data.student_id }, {
                $set: {
                    sec_email: new_email
                }
            });
            msg = "email changed successfull";
            if (new_mobile !== req.data.mobile) {
                if (new_mobile.length == 10) {
                    await Student.updateOne({ student_id: req.data.student_id }, {
                        $set: {
                            mobile: new_mobile
                        }
                    });
                    msg = "Email and mobile updated successfully";
                }
                else {
                    msg = "Email updated .Mobile Invalid !!";
                }
            };
        }
        else {
            msg = "invalid email";
        }
    }
    else if (new_mobile !== req.data.mobile) {
        if (new_mobile.length == 10) {
            await Student.updateOne({ student_id: req.data.student_id }, {
                $set: {
                    mobile: new_mobile
                }
            });
            if (msg === "email changed successfull")
                msg = "email and mobile updated successfully";
            else
                msg = "mobile changed successfully";
        }
        else {
            if (msg === "email changed successfull")
                msg = "email updated .mobile Invalid";
            else
                msg = "mobile Invalid";
        }
    }
    res.render("./edit_profile_student.ejs", { data: req.data, show: true, type: "success", msg: msg });
})
// change password students
router.post("/changepswd_student", middleware.login_stud, async (req, res) => {
    let ppswd = req.body.ppswd;
    let pswd = req.body.pswd;
    let cpswd = req.body.cpswd;
    if (!(ppswd && pswd && cpswd)) {
        return res.status(400).send({ error: "Data not formatted properly" });
    }
    let sid = req.data.student_id;
    if (pswd === cpswd) {
        const oldpswd = (await Student.find({ student_id: sid }))[0].password;
        if (await bcrypt.compare(ppswd, oldpswd)) {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(pswd, salt);
            await Student.updateOne({ student_id: sid }, {
                $set: {
                    password: password,
                    passwordChangedAt: new Date()
                }
            });
            res.render("./changepswd.ejs", { data: req.data, redbox: 0, show: true, type: "success", msg: "Successfull" });

        }
        else {
            res.render("./changepswd.ejs", { data: req.data, redbox: 1, show: true, type: "danger", msg: "Incorrect Password Entered" });
        }
    }
    else {

        res.render("./changepswd.ejs", { data: req.data, redbox: 3, show: true, type: "danger", msg: "Password must Match" });

    }

});

module.exports = router;