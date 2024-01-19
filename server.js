const express = require("express");
const app = express();
var path = require("path");
var session = require("express-session");
require("dotenv").config();
app.set("view engine", "ejs");
const mongo = require("mongoose");
const bodyParser = require('body-parser');
const rateLimiter = require("express-rate-limit");
const limiter = rateLimiter({ max: 500, windowMS: 2000 });
const middleware = require('./middleware/auth');


app.use(limiter);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SALT,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: true,      to save cookie only on https we use secure : true parameter
      expires: 6000000,
    },
  })
);
app.use(function (req, res, next) {
  if (!req.user) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
  }
  next();
});
// Connecting Database
mongo.connect(
  process.env.DB_URI,
  { usenewUrlParser: true }
);
const db = mongo.connection;
db.on("error", (error) => {
  console.error(error);
});
db.once("open", () => {
  console.log("connection complete");
});
app.use(express.static(path.join(__dirname, "/views")));
app.use('/assets', express.static('assets'))
// app.use(favicon())

app.use('/favicon.ico', express.static(path.join(__dirname, 'assets', 'favicon.ico')));

const Student = require("./models/Student")
const Coordinator = require("./models/Coordinator")
const Recruiter = require("./models/Recruiter")
const News = require("./models/News")
//testing
// app.use((req, res, next) => {
//   var cookie = req.headers.cookie;
//   if (cookie) {
//     dict = {}
//     arr = cookie.split(';');
//     for (var i = 0; i < arr.length; i++) {
//       let str = arr[i];
//       let sa = str.split('=');
//       dict[sa[0]] = sa[1]
//     }

//     if (dict.devPass === process.env.testUserPSWD) {
//       next();
//     }
//     else {
//       res.sendStatus(403);
//     }
//   }
//   else {
//     if (req.method == "POST") {
//       const pswd = req.body.pswd;
//       if (pswd && pswd == process.env.testUserPSWD) {
//         res.cookie('devPass', pswd, { maxAge: 1000 * 60 * 60 * 24 * 7 }).redirect("/");
//       }
//       else {
//         res.status(403).send("Authentication Failed");
//       }
//       return
//     }
//     res.render("soon.ejs");
//   }


// })

//get request for loading Page
app.get("/", async (req, res) => {
  const news = await News.find({});


  if (req.session.isAuth) {
    if (req.session.role === 'student') {
      role = "";
    } else if (req.session.role === 'recruiter') {
      role = "RECRUITER ";
    } else {
      role = "COORDINATOR ";
    }
  } else {
    role = "";
  }

  res.render("./home.ejs", { path: req.originalUrl, auth: { isAuth: req.session.isAuth, role: role }, news: news, data: { rankOverAll_nirf: 53, rankEngineering_nirf: 17, prev_year: 2021, maxCTC: "43 LPA", avgCTC: "15.53 LPA", ppos: "50 +", visitedCompanied: "150 +", internships: "180 +" } });
});

app.get("/dashboard", async (req, res) => {
  if (req.session.role === 'student') {
    res.redirect("/auth/home_student")
  } else if (req.session.role === 'recruiter') {
    res.redirect("/auth/home_recruiter");
  } else {
    res.redirect("/auth/home_coordinator");
  }
});


app.get("/getData", async (req, res) => {
  res.json({
    highestCTC_data: [40, 43, 21.5, 15.32, 13, 12.93, 13],
    averageCTC_data: [15.38, 13.61, 7.74, 8.31, 6.78, 7.07, 7.08]
  });
});
app.get("/login_student", (req, res) => {
  res.render("./Login.ejs", {
    name: 1,
    show: true,
    type: "success",
    msg: "Welcome",
  });
});
app.get("/login_coordinator", (req, res) => {
  res.render("./Login.ejs", {
    name: 2,
    show: true,
    type: "success",
    msg: "Welcome",
  });
});
app.get("/login_recruiter", (req, res) => {
  res.render("./Login.ejs", {
    name: 3,
    show: true,
    type: "success",
    msg: "Welcome",
  });
});

app.get("/policies", (req, res) => {
  res.render(__dirname + "/views/Placement_Policy.ejs")
})
app.get("/contactus", (req, res) => {


  if (req.session.isAuth) {
    if (req.session.role === 'student') {
      role = "";
    } else if (req.session.role === 'recruiter') {
      role = "RECRUITER ";
    } else {
      role = "COORDINATOR ";
    }
  } else {
    role = "";
  }

  res.render(__dirname + "/views/contactus.ejs", { path: req.originalUrl, auth: { isAuth: req.session.isAuth, role: role } })
});

const authRouter = require("./routes/auth.js");
app.use("/auth", authRouter);
const resumeRouter = require("./routes/resume.js");
app.use("/resume", resumeRouter);
const updateStudRouter = require("./routes/updateStud.js");
app.use("/updateStud", updateStudRouter);
const adminRouter = require("./routes/admin.js");
app.use("/admin", adminRouter);
const loginRouter = require("./routes/login.js");
app.use("/login", loginRouter);
const excelRouter = require("./routes/excel.js");
app.use("/excel", excelRouter);
const emailRouter = require("./routes/email.js");
app.use("/email", emailRouter);

const calendarRouter = require("./routes/calendar");
app.use("/calendar", middleware.login_coord, calendarRouter);

const redFlagRouter = require("./routes/redflag");
app.use("/flag", middleware.login_coord, redFlagRouter);

const { sendEmail } = require("./API/Mail/mail");
app.get("/mailTest", async (req, res) => {

  const ans = await sendEmail("bingra11@email.tjc.edu", "Test Email", "This is a test Email.")
  res.send("Email Sent");
})




app.get("*", (req, res) => {
  if (req.session.isAuth) {
    if (req.session.role === 'student') {
      role = "";
    } else if (req.session.role === 'recruiter') {
      role = "RECRUITER ";
    } else {
      role = "COORDINATOR ";
    }
  } else {
    role = "";
  }

  res.status(404).render("error.ejs", { path: req.originalUrl, error: { code: 404, message: "Sorry, the page you're looking for doesn't exist." }, auth: { isAuth: req.session.isAuth, role: role } })
})

const port = process.env.PORT || 2900;
app.listen(port);
console.log("is listening at ", port);
