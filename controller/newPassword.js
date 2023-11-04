const handleChangePassword = (req, res, db, bcrypt) => {
    const { email, password, newPassword, confirmNewPassword } = req.body;
    if (formPasswordValidationChecks(res, email, password, newPassword, confirmNewPassword) === true) {
        const newHash = bcrypt.hashSync(newPassword);
        db.select('email', 'hash').from('login')
            .where('email', '=', email)
            .then(user => {
                const isValidPassword = bcrypt.compareSync(password, user[0].hash);
                if (isValidPassword) {
                    return db('login')
                        .where('email', '=', email)
                        .update({
                            hash: newHash,
                        })
                        .then(rowsUpdated => {
                            if (rowsUpdated === 0) {
                                res.json("No rows updated");
                            } else {
                                res.json("Success");
                            }
                        })
                        .catch(err => res.json("Update"))
                } else {
                    res.status(400).json("Error")
                }
            }).catch(err => res.status("User not found"))
    }

};

const formPasswordValidationChecks = (res, email, password, newPassword, confirmNewPassword) => {
    if (!password || !newPassword || !confirmNewPassword) {
        return res.status(400).json("New")
    } 
    else if (!email) {
        return res.status(400).json("Email")
    }
    // Check if password at least 6 characters 
    else if (newPassword.length < 6) {
        return res.status(400).json("Length")
    }
    // Check if first character is aletter and starts with uppercase
    else if (!(/^[A-Z]/.test(newPassword.charAt(0)))) {
        return res.status(400).json("Uppercase")
    }
    else if (password === newPassword) {
        return res.status(400).json("Different")
    }
    else if (newPassword !== confirmNewPassword) {
        return res.status(400).json("Same")
    }
    return true
}




module.exports = {
    handleChangePassword: handleChangePassword
};