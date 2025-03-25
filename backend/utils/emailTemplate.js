export function registrationEmailTemplate({ name }) {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome to Our Service</title>
          <style>
            /* Base styles */
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f7fafc;
              color: #4a5568;
              line-height: 1.6;
            }
            
            /* Container */
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            
            /* Header */
            .header {
              background-color: #2f855a;
              padding: 20px;
              text-align: center;
            }
            
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
            }
            
            /* Content */
            .content {
              padding: 30px;
            }
            
            .welcome-text {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #2d3748;
            }
            
            .message {
              margin-bottom: 20px;
            }
            
            /* Footer */
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
              margin: 5px 0;
              font-size: 14px;
              color: #718096;
            }
            
            /* Button */
            .button {
              display: inline-block;
              background-color: #2f855a;
              color: #ffffff;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 600;
              margin: 20px 0;
            }
            
            /* Responsive adjustments */
            @media only screen and (max-width: 600px) {
              .container {
                width: 100%;
                margin: 0;
                border-radius: 0;
              }
              
              .content {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Service</h1>
            </div>
            <div class="content">
              <p class="welcome-text">Hello, ${name}!</p>
              <p class="message">
                Thank you for registering with us. We're thrilled to have you onboard and can't wait to help you get started with our services.
              </p>
              <p class="message">
                Your account has been successfully created and is ready to use.
              </p>
              <center>
                <a href="#" class="button">Get Started</a>
              </center>
              <p class="message">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
              </p>
            </div>
            <div class="footer">
              <p>Best regards,</p>
              <p>The Team</p>
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
      `
}

