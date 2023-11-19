const crypto = require('crypto');
const sendMail = require('../utility/sendMail')
const sendHtml = require('../utility/sendHtml')
require('dotenv').config();

const verifyUser = (req, res, db) => {
    const { token } = req.query;
    db('users')
        .where('verification_token', '=', token)
        .update({ email_verified: true })
        .then(response => {
            if (response) {
                res.send(sendHtml.onSuccessHTML())
            } else {
                res.send(sendHtml.onFailureHTML());
            }
        }).catch(console.log)
}

const resendVerificationEmail = async (req, res, db) => {
    const { email } = req.body;
    const newToken = generateToken()
    try {
        const updateQuery = await db.select('verification_token', 'name')
            .from('users')
            .where('email', '=', email)
            .update({ verification_token: newToken })
        if (updateQuery) {
            const name = await getName(db, email)
            sendMail.sendVerificationEmail(name, email, newToken)
            res.json("Verification sent")
        }
    } catch (err) {
        res.status(400).json(err)
    }
}

const getName = (db, email) => {
    return db.select('name')
        .from('users')
        .where('email', '=', email)
        .then(users => {
            if (users.length > 0) {
                return users[0].name;
            } else {
                throw new Error("User not found");
            }
        });
}

const generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
}

module.exports = {
    resendVerificationEmail: resendVerificationEmail,
    verifyUser: verifyUser
}