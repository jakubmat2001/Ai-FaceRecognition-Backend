// Add a user with the following data to our database
const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password, confirmPassword } = req.body;
    if (formRegisterValidationChecks(res, email, name, password, confirmPassword)) {
        // Check if email provided by a user already exists in the databse
        db.select('email').from('login').where('email', '=', email)
            .then(user => {
                if (user.length > 0 && user[0].email === email) {
                    console.log("same email");
                    return res.status(400).json("Existing Email")
                }
                const hash = bcrypt.hashSync(password); // Hash and store user entered password
                // Start a transaction which if fails, reverts all the changes made inside of it
                // This method is similar to conducting bank transfer transactions where if all the conditons are met
                // then all the code inside of the transactions exectures all together
                db.transaction(trx => {
                    trx.insert({
                        hash: hash,
                        email: email
                    })
                        .into('login') // Insert users email/password into login table within db
                        .returning('email') // Return email from the 'login' table
                        .then(loginEmail => {
                            return trx('users')
                                .returning('*') // Return all users from 'users' table
                                .insert({
                                    email: loginEmail[0].email,
                                    name: name,
                                    joined: new Date()
                                }).then(user => {
                                    res.json(user[0]); // Out of all users returned, return the one that registered
                                })
                        })
                        // Execute transaction if no errors, otherwise revert back to pre-transaction state
                        .then(trx.commit)
                        .catch(trx.rollback)
                }).catch(err => res.status(400).json("Failed"))
            })
    }
}

const formRegisterValidationChecks = (res, email, name, password, confirmPassword) => {
    // Ensure that no fields upon register subission are empty
    if (!email || !name || !password || !confirmPassword) {
        res.status(400).json("Unfilled From Fields")
        return false;
    }
    // Check if password at least 6 characters 
    if (password.length < 6) {
        res.status(400).json("Password Length")
        return false;
    }
    // Check if first character is aletter and starts with uppercase
    if (!(/^[A-Z]/.test(password.charAt(0)))) {
        res.status(400).json("Uppercase Letter")
        return false;
    }
    //  Check that password matches confirmed password
    if (password !== confirmPassword) {
        res.status(400).json("Same Password Entered")
        return false;
    }
    return true
}

module.exports = {
    handleRegister: handleRegister
};