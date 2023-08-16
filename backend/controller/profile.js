
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

module.exports = {
    handleProfile: handleProfile
}