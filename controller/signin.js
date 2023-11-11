const jwt = require("jsonwebtoken");
const redis = require("redis");

// Redis db, prepared for production deployment :)
const redisClient = redis.createClient({
    url: 'redis://redis:6379',
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
        return Promise.reject("Empty Form Fields")
    }
    return db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email) // Get email and hased password from login table
        .then(data => {
            if (data.length === 0) {
                return Promise.reject('User Not Found')
            }
            const isValidPassword = bcrypt.compareSync(req.body.password, data[0].hash); // See if the hashed password matches original
            if (isValidPassword) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email) // If password is valid, then check if email matches
                    .then(users => {
                        const user = users[0]
                        if (user.profile_img){
                            user.profile_img = Buffer.from(user.profile_img).toString('base64');
                        }
                        return users[0]
                    })
            }
            return Promise.reject("Password Not Matching")
            
        }).catch(err => err)
}


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
        }).catch(console.log("session not set"));
}

const handleSigninAuth = (db, bcrypt) => (req, res) => {
    const { authorization } = req.headers;
    return authorization ? getAuthTokenId(req, res)
        : handleSignin(db, bcrypt, req, res)
            .then(data =>
                data.id && data.email ? createSessions(data) : Promise.reject(data))
            .then(session => res.json(session))
            .catch(err => res.status(400).json(err));
}

module.exports = {
    handleSigninAuth: handleSigninAuth,
    redisClient: redisClient
}