const crypto = require('crypto');
const sendMail = require('../utility/sendMail')
require('dotenv').config();

const verifyUser = (req, res, db) => {
    const { token } = req.query;
    db('users')
    .where('verification_token', '=', token)
    .update({ email_verified: true })
    .then(response => {
        if (response){
            res.json({ success: true })
        }else{
            res.status(400).json("Verification token not matching");
        }
    }).catch(console.log)
}

const resendVerificationEmail = (req, res, db) => {
    const { email } = req.body;
    const newToken = generateToken()
    db.select('verification_token')
    .from('users')
    .where('email', '=', email)
    .update({ verification_token: newToken })
    .then(response => {
        if (response) {
            sendMail.sendVerificationEmail(email, newToken)
            res.json("Verification sent")
        }
    }).catch(err => res.status(400).json("error occured in resVer: " + err))
}


const generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
}

module.exports = {
    resendVerificationEmail: resendVerificationEmail,
    verifyUser: verifyUser
}