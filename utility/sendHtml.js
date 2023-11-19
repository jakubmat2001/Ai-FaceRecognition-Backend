const onSuccessHTML = () => {
    return (`<html>
    <head>
        <title>Verification Success</title>
        <style>
            body { 
                font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; 
                display: flex; justify-content: center; align-items: center; height: 100vh;
            }
            .verification-container { 
                display: flex; flex-direction: column;align-items: center;
                justify-content: center; text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="verification-container">
            <h1>Verification Successful</h1>
            <p>Your account has been successfully verified.</p>
            <p>You can now headback and signin</p>
        </div>
    </body>
</html>`)
}

const onFailureHTML = () => {
    return (`<html>
    <head>
        <title>Verification Unsuccessful... Try Again</title>
        <style>
            body { 
                font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; 
                display: flex; justify-content: center; align-items: center; height: 100vh;
            }
            .verification-container { 
                display: flex; flex-direction: column;align-items: center;
                justify-content: center; text-align: center;
            }

            .Error-paragraph {
                color: red;
            }
        </style>
    </head>
    <body>
        <div class="verification-container">
            <h1>Verification Unsuccessful</h1>
            <p class="Error-paragraph">Error.</p>
            <p>Verification error, try again</p>
        </div>
    </body>
</html>`)
}

module.exports = {
    onSuccessHTML: onSuccessHTML,
    onFailureHTML: onFailureHTML
}