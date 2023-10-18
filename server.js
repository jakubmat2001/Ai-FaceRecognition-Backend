const express = require("express");
const bodyParser = require("body-parser")
const knex = require('knex')
const cors = require('cors')
const bcrypt = require('bcryptjs');

// Importing routes to the end-point req
const register = require('./controller/register');
const signin = require('./controller/signin');
const profile = require('./controller/profile');
const image = require('./controller/image');
const password = require('./controller/newPassword')
const deleteAccount = require('./controller/deleteAccount')

const app = express()
app.use(bodyParser.json())
app.use(cors())


// Establising connection with our localy stored database on docker
// const db = knex({
//     client: 'pg',
//     connection: process.env.POSTGRES_URI
// });

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        port: 5432,
        user: 'postgres',
        password: 'lekcja11',
        database: 'facerecogndb'
    }
});

// Establising connection with our real database
// const db = knex({
//     client: 'pg',
//     connection: {
//         connectionString: process.env.DATABASE_URL,
//         ssl: {
//             rejectUnauthorized: false
//         }
//     }
// });

app.post("/register", (req, res) => { register.handleRegister(req, res, db, bcrypt) });
app.post("/signin", (req, res) => { signin.handleSignin(req, res, db, bcrypt) });
app.get("/profile/:id", (req, res) => { profile.handleProfile(req, res, db) });
app.put("/image", (req, res) => { image.handleImage(req, res, db) });
app.post("/imageurl", (req, res) => { image.handleImageURL(req, res) });
app.put("/password", (req, res) => { password.handleChangePassword(req, res, db, bcrypt) });
app.delete("/delete", (req, res) => { deleteAccount.handleDeleteAccount(req, res, db, bcrypt) });


app.listen(process.env.PORT || 3001, () => {
    console.log(`app is running on PORT: " + ${process.env.PORT}`)
});

