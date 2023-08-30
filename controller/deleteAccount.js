const handleDeleteAccount = (req, res, db, bcrypt) => {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) {
        return res.status(400).json("Submission")
    }
    db.select('hash').from('login')
        .where('email', '=', email)
        .then(data => {
            // Compare user entered password to the one stored in DB
            const isValidPassword = bcrypt.compareSync(password, data[0].hash);
            const matchingPassword = (password === confirmPassword); 
            if (isValidPassword && matchingPassword) {
                // Initiate transaction where the same user will be delete from users/login table
                return db.transaction(trx => {
                    return trx('login')
                        .where('email', '=', email)
                        .del()
                        .then(() => {
                            return trx('users')
                                .where('email', '=', email)
                                .del()
                        })
                        // Commit the transaction if successfull or revert changes if not
                        .then(trx.commit)
                        .catch(trx.rollback);
                }).then(() => {
                    res.json("Success")
                }).catch("Failed")
            } else {
                res.status(400).json("Password")
            }
        }).catch(err => {
            res.status(400).json("Error");
        });
}
module.exports = {
    handleDeleteAccount: handleDeleteAccount
};