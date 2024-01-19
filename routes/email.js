const express = require("express");
const router = express.Router();
const middleware = require('../middleware/auth');
const functions = require('../middleware/functions');
const Student = require('../models/Student');
const ApprovedDrive = require("../models/ApprovedDrive")

router.get('/send', async (req, res) => {
    const email = "vishnumali3911@gmail.com"
    const subject = "Checking after a much time"
    const body = `<h1>Hello User</h1>`
    let status = await functions.mail(email, subject, body);
    if (status) {
        res.send("Email send Successfully");
    }
    else {
        res.send("Some Error Occured");
    }


})


module.exports = router;