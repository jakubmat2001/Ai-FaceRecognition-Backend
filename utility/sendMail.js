const nodemailer = require("nodemailer");

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

module.exports = {
    sendVerificationEmail: sendVerificationEmail
}