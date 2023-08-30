// Add a user with the following data to our database
const handleRegister = (req, res, db, bcrypt) => {
    const {email, name, password} = req.body;
    if (!email || !name || !password){
        return res.status(400).json("Form")
    }
    // Check if password at least 6 characters 
    if (password.length < 6 ){
        return res.status(400).json("Lenght")
    }
    // Check if first character is aletter and starts with uppercase
    if (!(/^[A-Z]/.test(password.charAt(0)))) {
        return res.status(400).json("Uppercase")
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
};

module.exports = {
    handleRegister: handleRegister
};