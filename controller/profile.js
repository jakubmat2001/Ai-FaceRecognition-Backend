const { response } = require("express");

// Get user from our database 
const handleProfile = (req, res, db) => {
    const { id } = req.params;
    db.select('*').from('users').where({ 'id': id }).then(userID => {
        if (userID.length) {
            res.json((userID[0])); // Select all users from users table, output the one with matching id
        } else {
            res.status(400).json('User Not found')
        }

    }).catch(err => res.status(400).json('Error while getting user.'))
}

const handleProfileUpdate = (req, res, db) => {
    const { id } = req.params;
    const { name } = req.body.formInput;
    db('users')
    .where({ id })
    .update({ name: name })
    .then(response => {
        if (response) {
            res.json("success")
        } else {
            res.status(400).json("unable to update")
        }
    }).catch( err => res.status(400).json("error updating user profile"))
}

module.exports = {
    handleProfile: handleProfile,
    handleProfileUpdate: handleProfileUpdate
}