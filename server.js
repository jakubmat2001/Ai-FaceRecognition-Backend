const express = require("express");
const bodyParser = require("body-parser")
const knex = require('knex')
const cors = require('cors')
const bcrypt = require('bcryptjs');
const multer = require("multer");

// Importing routes to the end-point req
const register = require('./controller/register');
const signin = require('./controller/signin');
const profile = require('./controller/profile');
const image = require('./controller/image');
const password = require('./controller/newPassword')
const deleteAccount = require('./controller/deleteAccount')
const auth = require("./controller/authorization")

const app = express()
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(express.json());
app.use(cors())


// Establising connection with our localy stored database on docker
const db = knex({
    client: 'pg',
    connection: process.env.POSTGRES_URI
});



const upload = multer({ 
    dest: "/uploads",
    limits: {fieldNameSize: 1000}
})

app.post("/register", (req, res) => { register.handleRegister(req, res, db, bcrypt) });
app.post("/signin",  signin.handleSigninAuth(db, bcrypt));
app.post("/profile/:id", upload.fields([{ name: 'image' }, { name: 'name' }]), auth.requireAuth, (req, res) => {
     profile.handleProfileUpdate(req, res, db) 
    });

app.post("/imageurl", auth.requireAuth,(req, res) => { image.handleImageURL(req, res) });

app.get("/profile/:id",  auth.requireAuth, (req, res) => { profile.handleProfile(req, res, db) });
app.get("/verify-email", (req, res) => { register.verifyUser(req, res, db) });

app.put("/image", auth.requireAuth, (req, res) => { image.handleImage(req, res, db) });
app.put("/password", auth.requireAuth, (req, res) => { password.handleChangePassword(req, res, db, bcrypt) });

app.delete("/delete", auth.requireAuth, (req, res) => { deleteAccount.handleDeleteAccount(req, res, db, bcrypt) });

app.listen(process.env.PORT || 3001, () => {
    console.log(`app is running on PORT: " + ${process.env.PORT}`)
});

