
const getAllUsersData = (req, res, db) => {
    db.select("name", "entries").from("users")
    .then(users => {
        res.json(users)
    }).catch(err => console.log(err))
}


module.exports = {
    getAllUsersData: getAllUsersData
}