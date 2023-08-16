
// Check if an existing users credentials match 
const handleSignin = (req, res, db, bcrypt) => {
    const {email, password} = req.body;
    if (!email || !password){
        return res.status(400).json("Incorrect form submission")
    }
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email) // Get email and hased password from login table
        .then(data => {
            const isValidPassword = bcrypt.compareSync(req.body.password, data[0].hash); // See if the hashed password matches original
            if (isValidPassword) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email) // If password is valid, then check if email matches
                    .then(user => {
                        res.json(user[0]) // Return a user to the frontend if all conditions are met
                    })
                    .catch(err => res.status(400).json('Failed to get a user.'))
            } else {
                res.status(400).json("Wrong credentials entered.")
            }
        }).catch(err => res.status(400).json('This user doesnt exist.'))
}

module.exports = {
    handleSignin: handleSignin
}