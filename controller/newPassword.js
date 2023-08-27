const handleChangePassword = (req, res, db, bcrypt) => {
    const { email, password, newPassword } = req.body;
    if (!password || !newPassword) {
        return res.status(400).json("Enter your old and new passwords into form")
    } else if (!email) {
        return res.status(400).json("Email not found")
    }
    const newHash = bcrypt.hashSync(req.body.newPassword);
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(user => {
            const isValidPassword = bcrypt.compareSync(req.body.password, user[0].hash);
            const isSame = req.body.password === req.body.newPassword;
            if (!isSame && isValidPassword) {
                return db('login')
                    .where('email', '=', req.body.email)
                    .update({
                        hash: newHash,
                    })
                    .then(rowsUpdated => {
                        if (rowsUpdated === 0) {
                            res.json("No rows updated. Something went wrong.");
                        } else {
                            res.json("success");
                        }
                    })
                    .catch(err => res.json("Failed to update user password"))
            } else {
                res.status(400).json("Password entered was wrong, or you've entered the same password")
            }
        }).catch(err => res.status("Failed to find a user, please log-in and try again"))
};

module.exports = {
    handleChangePassword: handleChangePassword
};