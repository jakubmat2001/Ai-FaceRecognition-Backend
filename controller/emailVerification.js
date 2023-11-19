const crypto = require('crypto');
const sendMail = require('../utility/sendMail')
require('dotenv').config();

const verifyUser = (req, res, db) => {
    const { token } = req.query;
    db('users')
        .where('verification_token', '=', token)
        .update({ email_verified: true })
        .then(response => {
            if (response) {
                res.send(`<html>
                <head>
                    <title>Verification Success</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; 
                            display: flex; justify-content: center; align-items: center; height: 100vh;
                        }
                        .verification-container { 
                            display: flex; flex-direction: column;align-items: center;
                            justify-content: center; text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="verification-container">
                        <h1>Verification Successful</h1>
                        <p>Your account has been successfully verified.</p>
                        <p>You can now headback and signin</p>
                    </div>
                </body>
            </html>`)
            } else {
                res.status(400).json("Verification token not matching");
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