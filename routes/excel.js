const express = require("express");
const router = express.Router();
const middleware = require('../middleware/auth');
const Student = require('../models/Student');
const ApprovedDrive = require("../models/ApprovedDrive")
const xlsx = require("xlsx");
const path = require("path");
const functions = require("../middleware/functions");
const { Console } = require("console");
const filePath = "./public/xls/";
const sheetName = "Users";
worksheetColumns = [
    "FirstName",
    "LastName",
    "Branch",
    "Email",
    "Mobile",
    "Gender"
]
const exportToExcel = (raw_data, worksheetColumns, worksheetname, filePath) => {
    const data = raw_data.map((user) => {
        return [user.first_name, user.last_name, user.branch, user.clg_email, user.mobile, user.gender];
    })
    const workbook = xlsx.utils.book_new();
    const worksheetdata = [
        worksheetColumns,
        ...data
    ]
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetdata);
    xlsx.utils.book_append_sheet(workbook, worksheet, worksheetname);
    xlsx.writeFile(workbook, path.resolve(filePath));
}
router.get("/sendList", middleware.login_coord, async (req, res) => {
    const id = req.query.id;
    try {
        const slist = (await ApprovedDrive.find({ _id: id, "applied.status": "approved" }, { _id: 0, applied: 1 }))[0].applied.filter(el => {
            return el.status == "approved";
        });
        data = []
        for (var i = 0; i < slist.length; i++) {
            e = slist[i]
            data.push((await Student.find({ _id: e.candidateId }, { _id: 0, first_name: 1, last_name: 1, gender: 1, clg_email: 1, mobile: 1, branch: 1 }))[0])
        }
        exportToExcel(data, worksheetColumns, sheetName, `${filePath + id}.xlsx`);
        await ApprovedDrive.updateOne({ _id: id }, {
            $set: { "process.currentStatus": "s2" }
        })
        res.redirect("/auth/home_coordinator");

    }
    catch (err) {
        res.send(`Something went wrong : ${err}`)
    }
    console.log("done");
});
router.get("/getList", middleware.login_coord, async (req, res) => {
    const id = req.query.id;
    res.sendFile(`${__dirname.replace("routes", "public")}/xls/${id}.xlsx`);
})
router.get("/getListStud", middleware.login_recr, async (req, res) => {
    const id = req.query.id;
    res.sendFile(`${__dirname.replace("routes", "public")}/xls/${id}.xlsx`);
})
const f2 = functions.uploadResult.single("result");
router.post("/uploadResult", middleware.login_recr, (req, res, next) => {
    if (!req.query.id) {
        res.sendStatus(404);
    };
    req.resultID = req.query.id.trim();
    f2(req, res, function (err) {
        if (err) {
            return res.status(404).send({ message: err.message })
        }
        next();
    })
}, async (req, res) => {
    await ApprovedDrive.updateOne({ _id: req.query.id }, {
        $set: { "process.currentStatus": "s3" }
    })
    res.redirect("/auth/home_recruiter");
})

module.exports = router;