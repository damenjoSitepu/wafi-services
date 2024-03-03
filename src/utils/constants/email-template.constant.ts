export namespace emailTemplate {
  export namespace auth {
    export const signUpVerification = (link: string): string => {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4 !important;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
        
                .container {
                    max-width: 400px !important;
                    padding: 20px !important;
                    background-color: #fff !important;
                    border-radius: 8px !important;
                }
        
                h3 {
                    margin-top: 0;
                    color: #333;
                }
        
                p {
                    margin-bottom: 20px;
                    line-height: 20px;
                    font-size: 12px;
                    color: #666;
                }
        
                .btn {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4f46e5;
                    color: #fff !important;
                    text-decoration: none;
                    border-radius: 4px;
                    transition: background-color 0.3s;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container" style="text-align: center; margin: auto; border: 1x solid #f1f5f9 !important; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;">
                <h2 style="font-weight: bold; font-size: 24px; letter-spacing: 4px; color: #4f46e5; margin-bottom: 0;">Wafi</h2>
                <h3 style="margin-top: 0;">User Sign-Up Verification</h3>
                <p>One small step left before you join as a beta user in our application. Please verify yourself by clicking this button below. After this done, you might be able to logged in to our web app with your email and password</p>
                <a href="${link}" class="btn">Verify Account</a>
            </div>
        </body>
        </html>            
      `
    };

    export const resendSignUpVerification = (link: string): string => {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4 !important;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
        
                .container {
                    max-width: 400px !important;
                    padding: 20px !important;
                    background-color: #fff !important;
                    border-radius: 8px !important;
                }
        
                h3 {
                    margin-top: 0;
                    color: #333;
                }
        
                p {
                    margin-bottom: 20px;
                    line-height: 20px;
                    font-size: 12px;
                    color: #666;
                }
        
                .btn {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4f46e5;
                    color: #fff !important;
                    text-decoration: none;
                    border-radius: 4px;
                    transition: background-color 0.3s;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container" style="text-align: center; margin: auto; border: 1x solid #f1f5f9 !important; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;">
                <h2 style="font-weight: bold; font-size: 24px; letter-spacing: 4px; color: #4f46e5; margin-bottom: 0;">Wafi</h2>
                <h3 style="margin-top: 0;">User Sign-Up Verification</h3>
                <p>It seems you haven't completed the user verification for the link we sent to your email earlier. Alright then, here's the new link. Please click the button down below.</p>
                <a href="${link}" class="btn">Verify Account</a>
            </div>
        </body>
        </html>            
      `
    };
  }
}