const { response } = require("express");
const fs = require('fs');

// Get user from our database 
const handleProfile = (req, res, db) => {
    const { id } = req.params;
    db.select('*').from('users').where({ id }).then(users => {
        if (users.length) {
            const user = users[0];
            if (user.profile_img) {
                // Convert the binary data from the 'bytea' column to a base64 stringss
                user.profile_img = Buffer.from(user.profile_img).toString('base64');
            }
            res.json(user); // Send the user data including the converted image
        } else {
            res.status(400).json('User not found');
        }
    }).catch(err => res.status(400).json('Error while getting user: ' + err));
}


const handleProfileUpdate = (req, res, db) => {
    const { id } = req.params;
    const { name } = req.body; 
    // Check if image passed by exists and if not set imageFile const to null
    const imageFile = req.files && req.files["image"] ? req.files["image"][0] : null; 

    console.log(name); 
    console.log(imageFile); 

    // Prepare the update object
    const updateObject = { name: name };
    if (imageFile) {
        // Use the asynchronous method to read the file
        fs.readFile(imageFile.path, (err, imageBuffer) => {
            if (err) {
                console.error(err);
                return res.status(500).json("Error reading image file");
            }
            
            updateObject.profile_img = imageBuffer;

            // Update the user's profile in the database
            db('users')
            .where({ id })
            .update(updateObject)
            .then(response => {
                if (response) {
                    // Convert the image buffer to a Base64 string for the response
                    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
                    res.json({ success: true, profile_img: `data:image/png;base64,${imageBase64}` }); // Assuming the image is a JPEG
                } else {
                    res.status(400).json("Unable to update");
                }
            })
            .catch(err => res.status(400).json("Error updating user profile: " + err))
            .finally(() => {
                // Clean up the uploaded file asynchronously
                fs.unlink(imageFile.path, unlinkErr => {
                    if (unlinkErr) {
                        console.error("Error removing temporary image file", unlinkErr);
                    }
                });
            });
        });
    } else {
        // If there's no image file, just update the name
        db('users')
        .where({ id })
        .update(updateObject)
        .then(response => {
            if (response) {
                res.json("success");
            } else {
                res.status(400).json("Unable to update");
            }
        })
        .catch(err => res.status(400).json("Error updating user profile: " + err));
    }
};


module.exports = {
    handleProfile: handleProfile,
    handleProfileUpdate: handleProfileUpdate
}