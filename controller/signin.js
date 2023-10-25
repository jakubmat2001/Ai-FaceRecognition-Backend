const jwt = require("jsonwebtoken");
const redis = require("redis");

// Redis db
const redisClient = redis.createClient(process.env.REDIS_URI);

// Check if an existing users credentials match 
const handleSignin = (db, bcrypt, req, res) => {
    const {email, password} = req.body;
    if (!email || !password){
        return Promise.reject("Form")
    }
    return db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email) // Get email and hased password from login table
        .then(data => {
            const isValidPassword = bcrypt.compareSync(req.body.password, data[0].hash); // See if the hashed password matches original
            if (isValidPassword) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email) // If password is valid, then check if email matches
                    .then(user =>  user[0]) // Return a user to the frontend if all conditions are met
                    .catch(err => Promise.reject('Not Found'))
            } else {
                Promise.reject("Password Not Matching")
            }
        }).catch(err => Promise.reject('Not Existing'))
}

const getAuthTokenId = () => {
    console.log("signin authorized");
    // return redisClient.get(authorization, (err, reply) => {
    //     if (err || !reply){
    //         return res.status(400).json("unathroized");
    //     }
    //     return res.json({id: reply})
    // });
}

// const setToken = (token, id) => {
//     return Promise.resolve(redisClient.set(token, id))
// }

const createSessions = async (user) => {
    const {email, id } = user;
    const token = signinToken(email)
    return { success: "true", userID: id, token };
}

const signinToken = (email) => {
    const jwtPayload = {email};
    return jwt.sign(jwtPayload, 'JWT-SECRET', {expiresIn: "1h"});
}

const handleSigninAuth = (db, bcrypt) => (req, res) => {
    const { authorization } = req.headers;
    return authorization ? getAuthTokenId() : handleSignin(db, bcrypt, req, res)
    .then(data => {
        return data.id && data.email ? createSessions(data) : Promise.reject(data)
    })
    .then(session => res.json(session))
    .catch(err => res.status(400).json(err))
}

module.exports = {
    handleSigninAuth: handleSigninAuth,
    handleSignin: handleSignin
}