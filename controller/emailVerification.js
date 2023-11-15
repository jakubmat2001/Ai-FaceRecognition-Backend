const nodemailer = require("nodemailer");
const crypto = require('crypto');
require('dotenv').config();

const resendVerificationEmail = (req, res, db) => {
    const { email } = req.body;
    const newToken = generateToken()
    db.select('verification_token')
    .from('users')
    .where('email', '=', email)
    .update({ verification_token: newToken })
    .then(response => {
        if (response) {
            sendVerificationEmail(email, newToken)
            res.json("Verification sent")
        }
    }).catch(err => res.status(400).json("error occured in resVer: " + err))
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = (email, token) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `<p>Click <a href="http://localhost:3001/verify-email?token=${token}">here</a> to verify your email.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("ERR COMMING FROM IF ERROR ON NODEMAILER")
            console.log(error);
        } else {
            console.log('Verification email sent: ' + info.response);
        }
    });
};

const generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
}

module.exports = {
    resendVerificationEmail: resendVerificationEmail
}