
const { sendEmail } = require("../API/Mail/mail");
const crypto = require('crypto');
const bcrypt = require('bcrypt');

async function sendToken(req, res, User, query, role) {
    await new Promise(function (resolve, reject) {
        User.findOne(query)
            .then(user => {

                if (!user) return res.status(401).render("forgotPassword.ejs", { show: true, type: "danger", msg: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.', name: "", role: role });

                //Generate and set password reset token
                user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
                user.resetPasswordExpires = Date.now() + 3600000; //expires in an hour


                // Save the updated user object
                user.save()
                    .then(user => {
                        // send email
                        let link = "https://placements.mnit.ac.in" + "/auth/resetpass?token=" + user.resetPasswordToken + "&role=" + role;

                        let text = `Hi , <br> 
                    Please click on the following link ${link} to reset your password. <br><br> 
                    If you did not request this, please ignore this email and your password will remain unchanged.<br>`;

                        sendEmail(user.email || user.clg_email, "Password change request", text);
                        resolve();
                    })
                    .catch(err => res.status(401).render("forgotPassword.ejs", { show: true, type: "danger", msg: err, name: "", role: role }));
            })
    })
        .catch(err => res.status(401).render("forgotPassword.ejs", { show: true, type: "danger", msg: err, name: "", role: role }));
}


async function resetPassword(req, res, User, token, role) {
    await new Promise((resolve, reject) => {
        try {
            User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
                .then(async (user) => {

                    if (!user) return res.status(401).render("forgotPassword.ejs", { show: true, type: "danger", msg: "Password reset token is invalid or has expired.", name: "", role: role });

                    let newpswd = Math.random().toString(36).slice(-8);

                    const salt = await bcrypt.genSalt(10);
                    const password = await bcrypt.hash(newpswd, salt);

                    //Set the new password
                    user.password = password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    user.passwordChangedAt = new Date()

                    // Save
                    user.save(async (err) => {
                        if (err) return res.status(500).json({ message: err.message });

                        let text = `Dear,<br>
                Your password is reset<br>
                Your Login Details are as follows:<br>
                <br>
                User Id: ${user.student_id || user.email}<br>
                Password: ${newpswd}<br>
                <br>
                Password can be reset from the change password icon.<br>
                <br>
                NOTE: This is an auto generated mail. Please do not reply to this mail.<br>
                <br>
                Regards,<br>
                MNIT Placement Portal<br>`

                        await sendEmail(user.email || user.clg_email, "New Password Details", text);
                        resolve();
                    });
                });
        }
        catch (err) {
            res.sendStatus(401);
            console.log(err);
        }
    })

    return true

}



module.exports = { resetPassword, sendToken }
