const jwt = require("jsonwebtoken");
const redis = require("redis");
require('dotenv').config();

// Redis db, prepared for production deployment :)
const redisClient = redis.createClient({
    host: process.env.REDIS_URI,
    port: process.env.REDIS_PORT,
    legacyMode: true
});

async function redisConnect() {
    return await redisClient.connect();
}
redisConnect()


// Check if an existing users credentials match 
const handleSignin = (db, bcrypt, req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return Promise.reject("Empty Form Fields");
    }
    return db.select('email_verified').from('users').where('email', '=', email)
        .then(verifUser => {
            if (verifUser.length === 0) {
                return Promise.reject('User Not Found');
            }
            if (verifUser[0].email_verified == true) {
                return db.select('email', 'hash').from('login')
                    .where('email', '=', email) // Get email and hashed password from login table
                    .then(data => {
                        if (data.length === 0) {
                            return Promise.reject('User Not Found');
                        }
                        const isValidPassword = bcrypt.compareSync(password, data[0].hash); // See if the hashed password matches original
                        if (isValidPassword) {
                            return db.select('*').from('users')
                                .where('email', '=', email) // If password is valid, then check if email matches
                                .then(users => {
                                    const user = users[0];
                                    if (user.profile_img) {
                                        user.profile_img = Buffer.from(user.profile_img).toString('base64');
                                    }
                                    return user;
                                })
                        } else {
                            return Promise.reject("Password Not Matching");
                        }
                    });
            } else {
                return Promise.reject("User not verified");
            }
        })
};

const signinToken = (email) => {
    const jwtPayload = { email };
    return jwt.sign(jwtPayload, 'JWT-SECRET', { expiresIn: "1h" });
}

const getAuthTokenId = (req, res) => {
    const { authorization } = req.headers;
    return redisClient.GET(authorization, (err, reply) => {
        if (err || !reply) {
            return res.status(401).send("unauthorized");
        }
        return res.json({ id: reply });
    });
}


const setToken = (token, id) => {
    return Promise.resolve(redisClient.SET(token, id))
}

const createSessions = (user) => {
    const { email, id } = user;
    const token = signinToken(email)
    return setToken(token, id)
        .then(() => {
            return { success: "true", userID: id, token }
        }).catch(err => err);
}

// Convert this to try statment
const handleSigninAuth = (db, bcrypt) => (req, res) => {
    const { authorization } = req.headers;
    if (authorization) {
        return getAuthTokenId(req, res);
    } else {
        return handleSignin(db, bcrypt, req, res)
            .then(data => {
                if (data.id && data.email) {
                    return createSessions(data);
                } 
            })
            .then(session => res.json(session))
            .catch(err => {
                res.status(400).json(err);
            })
    }
};

module.exports = {
    handleSigninAuth: handleSigninAuth,
    redisClient: redisClient
}