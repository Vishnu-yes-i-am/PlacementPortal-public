const multer = require('multer');
const Str = require('@supercharge/strings')
const emailValidator = require('email-validator');
const Student = require("../models/Student")
const Recruiter = require("../models/Recruiter")
const Coordinator = require("../models/Coordinator")
const { fstat } = require("fs");
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/uploads`);
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${Date.now()}pphoto-${req.data._id}.${ext}`);
    },
});
const multerStorage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `public/results`);
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `result-${req.resultID}.xlsx`);
    },
});
const imageFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
        cb(null, true);
    } else {
        cb(new Error("Not a image !!"), false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: imageFilter,
});
const upload2 = multer({
    storage: multerStorage2
});
// validating Email
const isEmailValid = async (email) => {
    // simple email validator
    return emailValidator.validate(email);
}
//search suggestion system
class Trie {
    constructor() {
        this.head = {};
    }
    add(word) {
        var curr;
        curr = this.head;
        for (var i = 0; i < word.length; i += 1) {
            let ch = word[i];
            if (!(ch in curr)) {
                curr[ch] = {};
            }
            curr = curr[ch];
        }

        curr["*"] = true;
    }
    f(curr, s, arr) {
        for (let el in curr) {
            if (el == "*") {
                arr.push(s);
            } else {
                this.f(curr[el], s + el, arr);
            }
        }
    }

    find(word) {
        var arr, curr, i;
        arr = [];
        curr = this.head;
        i = 0;
        while (i < word.length && (word[i] in curr)) {
            curr = curr[word[i]];
            i += 1;
        }
        if (i === word.length) {
            this.f(curr, word, arr);
            return arr;
        } else {
            return [];
        }
    }

}
const suggestedProducts = (products, searchWord) => {
    var a, res, tree;
    tree = new Trie();
    for (var i = 0; i < products.length; i += 1) {
        let el = products[i];
        tree.add(el);
    }
    res = [];

    for (var j = 1; j < searchWord.length + 1; j += 1) {
        a = tree.find(searchWord.slice(0, j));
        a.sort();
        if (a.length > 3) {
            res.push(a.slice(0, 3));
        } else {
            res.push(a);
        }
    }

    return res;
}


//generating  Token
const generateToken = () => {
    return Str.random(50);
}

// Sending Notice to a role 
const sendmsg = async (s, msg) => {
    console.log(s, "hehe");
    if (s.domain === "auth/showStudents") {
        await Student.updateOne({ student_id: s.id }, {
            $push: {
                inbox: msg
            }
        });
    }
    else if (s.domain === "auth/showRecruiters") {
        console.log("sending to recruiter");
        await Recruiter.updateOne({ email: s.id }, {
            $push: {
                inbox: msg
            }
        });
    }
    else if (s.domain === "auth/showCoordinators") {
        await Coordinator.updateMany({ email: s.id }, {
            $push: {
                inbox: msg
            }
        });
    }
    else if (s.domain === "allStudents") {
        await Student.updateMany({}, {
            $push: {
                inbox: msg
            }
        });
    }
    else if (s.domain === "Coordinators") {
        await Coordinator.updateMany({}, {
            $push: {
                inbox: msg
            }
        });
    }
    else if (s.domain === "Recruiterss") {
        await Recruiter.updateMany({}, {
            $push: {
                inbox: msg
            }
        });
    }
};
const nodemailer = require('nodemailer')
require("dotenv").config();
let transporter = nodemailer.createTransport({
    service: "yahoo",
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

const mail = async (email, subject, body) => {
    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        html: body
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false
        } else {
            console.log('Email sent: ' + info.response);
            return true
        }
    });
}
module.exports = {
    sendmsg: sendmsg,
    generateToken: generateToken,
    suggestedProducts: suggestedProducts,
    isEmailValid: isEmailValid,
    upload: upload,
    mail: mail,
    uploadResult: upload2
}