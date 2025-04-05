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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            color: #333333;
            line-height: 1.6;
          }
          
          /* Container */
          .container {
            max-width: 580px;
            margin: 24px auto;
            background-color: #ffffff;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          
          /* Header */
          .header {
            background-color: #3b82f6;
            padding: 28px 24px;
            text-align: center;
          }
          
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            font-weight: 500;
            letter-spacing: 0.2px;
          }
          
          /* Content */
          .content {
            padding: 32px 28px;
          }
          
          .welcome-text {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 16px;
            color: #1f2937;
          }
          
          .message {
            margin-bottom: 16px;
            color: #4b5563;
            font-size: 15px;
          }
          
          /* Footer */
          .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #edf2f7;
          }
          
          .footer p {
            margin: 4px 0;
            font-size: 13px;
            color: #6b7280;
          }
          
          /* Button */
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            margin: 20px 0;
            font-size: 15px;
            transition: background-color 0.2s;
          }
          
          .button:hover {
            background-color: #2563eb;
          }
          
          .button-container {
            text-align: center;
            margin: 24px 0;
          }
          
          /* Responsive adjustments */
          @media only screen and (max-width: 600px) {
            .container {
              width: 100%;
              margin: 0;
              border-radius: 0;
            }
            
            .content {
              padding: 24px 20px;
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
            <p class="welcome-text">Hello, ${name}</p>
            <p class="message">
              Thank you for registering with us. We're thrilled to have you onboard and can't wait to help you get started with our services.
            </p>
            <p class="message">
              Your account has been successfully created and is ready to use.
            </p>
            <div class="button-container">
              <a href="#" class="button">Get Started</a>
            </div>
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


