const express = require("express");
const { cloudidentity_v1beta1 } = require("googleapis");
const router = express.Router();
const middleware = require('../middleware/auth')
const Student = require("../models/Student")

router.get("/redflag", middleware.login_coord, (req, res) => {
    res.render("redflag.ejs", { data: req.data });
})

router.get("/getFStudDetail", middleware.login_coord, async (req, res) => {
    let sid = req.query.sid;
    console.log(sid);
    if (!sid)
        res.sendStatus(403);
    try {
        const data = await Student.find({ student_id: sid }, { first_name: 1, last_name: 1, branch: 1 });
        res.json(data[0]);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(401);
    }

})

router.post("/addFlag", middleware.login_coord, async (req, res) => {
    console.log(req.body);
    let sid = req.body.sid;
    let count = parseInt(req.body.fcount);
    let reason = req.body.reason;
    try {
        const predata = await Student.findOneAndUpdate({ student_id: sid }, {
            $inc: { flagcount: count },
            $push: { flags: { count: count, reason: reason, by: req.data._id } }
        });
        const flags = predata.flagcount + count;
        console.log(flags);
        if (flags === 1) {
            await Student.updateOne({ student_id: sid }, {
                //flagged for 15 days
                $set: { flaggedUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15) }
            })
        }
        else if (flags === 2) {
            //flagged for 30 days
            await Student.updateOne({ student_id: sid }, {
                $set: { flaggedUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) }
            })
        }
        else {
            //flagged for 365 days
            await Student.updateOne({ student_id: sid }, {
                $set: { flaggedUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) }
            })
        }
        res.redirect('/auth/home_coordinator');

    }
    catch (err) {
        res.sendStatus(401);
        console.log(err);
    }
})

module.exports = router;