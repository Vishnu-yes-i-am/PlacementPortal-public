const nodemailer = require('nodemailer')
require("dotenv").config();

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;



const sendGmail = async (email, subject, body) => {
    const myOAuth2Client = new OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    )

    myOAuth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });
    const myAccessToken = myOAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.GMAIL,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: myAccessToken 
        }
    });

    let from = `Placement Portal <${process.env.EMAIL}>`
    var mailOptions = {
        from: from,
        to: email,
        subject: subject,
        html: body
    };
    result = await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false
        } else {
            console.log('Email sent: ' + info.response);
            return true
        }
    });
    return result
}





// Send using Yahoo
const sendEmail = async (email, subject, body) => {
    let transporter = nodemailer.createTransport({
        service: "yahoo",
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
    });

    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        html: body
    };
    result = await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false
        } else {
            console.log('Email sent: ' + info.response);
            return true
        }
    });
    return result
}

module.exports = { sendEmail: sendGmail }