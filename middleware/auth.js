const Student = require("../models/Student.js");
const Recruiter = require("../models/Recruiter");
const Coordinator = require("../models/Coordinator.js");
const path = require('path');
const fs = require('fs');
module.exports = {
    login_stud: async (req, res, next) => {
        if (req.session.isAuth) {
            const token = req.session.token;
            const id = req.session.student_id;
            if (id && token) {
                const data = await Student.find({ student_id: id });
                if (data.length === 1) {
                    if (data[0].temp_token === token) {
                        req.verdict = true;
                        req.data = data[0];
                    }
                    else {
                        req.verdict = false;
                        req.msg = "unauthorised";
                    }
                }
                else {
                    req.verdict = false;
                    req.msg = "forbidden";
                }
            }
            else {
                req.verdict = false;
                req.msg = "forbidden";
            }
        }
        else {
            req.verdict = false;
            req.msg = "forbidden";
        }
        if (req.verdict) {
            next()
        }
        else {
            res.render("./Login.ejs", { name: 1, show: true, type: "danger", msg: "Please Login First" });
        }
    },
    login_coord: async (req, res, next) => {
        if (req.session.isAuth) {
            const token = req.session.token;
            const id = req.session.email;
            if (id && token) {
                const data = await Coordinator.find({ email: id });
                if (data.length === 1) {
                    if (data[0].temp_token === token) {
                        const role = data[0].role;
                        req.verdict = true;
                        req.data = data[0];
                    }
                    else {
                        req.verdict = false;
                        req.msg = "unauthorised";
                    }
                }
                else {
                    req.verdict = false;
                    req.msg = "forbidden";
                }
            }
            else {
                req.verdict = false;
                req.msg = "forbidden";
            }
        }
        else {
            req.verdict = false;
            req.msg = "forbidden";
        }
        if (req.verdict) {
            next()
        }
        else {
            res.render("./Login.ejs", { name: 2, show: true, type: "danger", msg: "Please Login First" });
        }
    },
    login_admin: async (req, res, next) => {
        if (req.session.isAuth) {
            const token = req.session.token;
            const id = req.session.email;
            if (id && token) {
                const data = await Coordinator.find({ email: id, role: 1 });
                if (data.length === 1) {
                    if (data[0].temp_token === token) {
                        req.verdict = true;
                        req.data = data[0];
                    }
                    else {
                        req.verdict = false;
                        req.msg = "unauthorised";
                    }
                }
                else {
                    req.verdict = false;
                    req.msg = "forbidden";
                }
            }
            else {
                req.verdict = false;
                req.msg = "forbidden";
            }
        }
        else {
            req.verdict = false;
            req.msg = "forbidden";
        }
        if (req.verdict) {
            next()
        }
        else {
            res.render("./Login.ejs", { name: 2, show: true, type: "danger", msg: "Please Login First" });
        }
    }
    ,
    login_recr: async (req, res, next) => {
        if (req.session.isAuth) {
            const token = req.session.token;
            const id = req.session.email;
            if (id && token) {
                const data = await Recruiter.find({ email: id });
                if (data.length === 1) {
                    if (data[0].temp_token === token) {
                        req.verdict = true;
                        req.data = data[0];
                    }
                    else {
                        req.verdict = false;
                        req.msg = "unauthorised";
                    }
                }
                else {
                    req.verdict = false;
                    req.msg = "forbidden";
                }
            }
            else {
                req.verdict = false;
                req.msg = "forbidden";
            }
        }
        else {
            req.verdict = false;
            req.msg = "forbidden";
        }
        if (req.verdict) {
            next()
        }
        else {
            res.render("./Login.ejs", { name: 3, show: true, type: "danger", msg: "Please Login First" });
        }
    },
    check_dir: async (req, res, next) => {
        const dir = path.join(__dirname.replace("middleware", "public"), `/images/${req.data._id}`)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        next();
    }
}