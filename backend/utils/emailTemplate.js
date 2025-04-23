const LOGO_URL = 'https://yourtripshare.com/assets/logo.png';

export function registrationEmailTemplate({ name }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to TripShare</title>
        <style>
          /* Base styles */
          :root {
            --primary: #4ade80;
            --primary-dark: #22c55e;
            --secondary: #333333;
            --light-bg: #f9fafb;
            --border: #e5e7eb;
            --text-dark: #1f2937;
            --text-medium: #4b5563;
            --text-light: #6b7280;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: var(--text-dark);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          
          /* Container */
          .container {
            max-width: 580px;
            margin: 24px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          
          /* Header */
          .header {
            padding: 24px;
            text-align: center;
            border-bottom: 1px solid var(--border);
          }
          
          .logo {
            height: 40px;
            width: auto;
          }
          
          /* Hero section */
          .hero {
            background-color: var(--primary);
            padding: 36px 24px;
            text-align: center;
          }
          
          .hero h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
          
          .hero p {
            color: #ffffff;
            margin: 12px 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          
          /* Content */
          .content {
            padding: 32px 28px;
          }
          
          .welcome-text {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--text-dark);
          }
          
          .message {
            margin-bottom: 16px;
            color: var(--text-medium);
            font-size: 15px;
            line-height: 1.6;
          }
          
          /* Info box */
          .info-box {
            background-color: var(--light-bg);
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 24px;
          }
          
          .info-box p {
            font-size: 14px;
            color: var(--text-medium);
            margin-bottom: 8px;
          }
          
          .info-box p:last-child {
            margin-bottom: 0;
          }
          
          /* Footer */
          .footer {
            background-color: var(--light-bg);
            padding: 24px;
            text-align: center;
            border-top: 1px solid var(--border);
          }
          
          .footer p {
            margin: 4px 0;
            font-size: 13px;
            color: var(--text-light);
          }
          
          /* Button */
          .button {
            display: inline-block;
            background-color: var(--primary);
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.2s ease;
          }
          
          .button:hover {
            background-color: var(--primary-dark);
            transform: translateY(-1px);
          }
          
          .button-container {
            text-align: center;
            margin: 28px 0;
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
            
            .hero h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${LOGO_URL}" alt="TripShare" class="logo" />
          </div>
          
          <div class="hero">
            <h1>Travel Together. Save Together.</h1>
            <p>Join our community of travelers across the country</p>
          </div>
          
          <div class="content">
            <p class="welcome-text">Hello, ${name}</p>
            <p class="message">
              Thank you for joining TripShare! We're excited to help you connect with travelers, 
              save money, reduce emissions, and make new connections.
            </p>
            
            <div class="info-box">
              <p>Your account has been successfully created and is ready to use.</p>
              <p>You can now start finding rides or offering your own trips to others.</p>
            </div>
            
            <div class="button-container">
              <a href="https://yourtripshare.com/login" class="button">Get Started</a>
            </div>
            
            <p class="message">
              If you have any questions or need assistance, our support team is always here to help.
            </p>
          </div>
          
          <div class="footer">
            <p>Safe travels,</p>
            <p>The TripShare Team</p>
            <p>&copy; ${new Date().getFullYear()} TripShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function resetPasswordEmailTemplate({ name, resetUrl, expiresIn }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your TripShare Password</title>
        <style>
          /* Base styles */
          :root {
            --primary: #4ade80;
            --primary-dark: #22c55e;
            --warning: #f59e0b;
            --warning-dark: #d97706;
            --secondary: #333333;
            --light-bg: #f9fafb;
            --border: #e5e7eb;
            --text-dark: #1f2937;
            --text-medium: #4b5563;
            --text-light: #6b7280;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: var(--text-dark);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          
          /* Container */
          .container {
            max-width: 580px;
            margin: 24px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          
          /* Header */
          .header {
            padding: 24px;
            text-align: center;
            border-bottom: 1px solid var(--border);
          }
          
          .logo {
            height: 40px;
            width: auto;
          }
          
          /* Hero section */
          .hero {
            background-color: var(--warning);
            padding: 36px 24px;
            text-align: center;
          }
          
          .hero h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
          
          .hero p {
            color: #ffffff;
            margin: 12px 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          
          /* Content */
          .content {
            padding: 32px 28px;
          }
          
          .welcome-text {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--text-dark);
          }
          
          .message {
            margin-bottom: 16px;
            color: var(--text-medium);
            font-size: 15px;
          }
          
          /* Note */
          .note {
            font-size: 14px;
            color: var(--text-medium);
            margin-top: 24px;
            padding: 16px;
            background-color: var(--light-bg);
            border-radius: 6px;
            border-left: 3px solid var(--warning);
          }
          
          .note p {
            margin: 0 0 8px 0;
          }
          
          .note p:last-child {
            margin-bottom: 0;
          }
          
          /* Link container */
          .link-container {
            margin: 16px 0;
            word-break: break-all;
            background-color: var(--light-bg);
            padding: 16px;
            border-radius: 6px;
            border: 1px solid var(--border);
            font-size: 14px;
            color: var(--text-medium);
          }
          
          /* Footer */
          .footer {
            background-color: var(--light-bg);
            padding: 24px;
            text-align: center;
            border-top: 1px solid var(--border);
          }
          
          .footer p {
            margin: 4px 0;
            font-size: 13px;
            color: var(--text-light);
          }
          
          /* Button */
          .button {
            display: inline-block;
            background-color: var(--warning);
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.2s ease;
          }
          
          .button:hover {
            background-color: var(--warning-dark);
            transform: translateY(-1px);
          }
          
          .button-container {
            text-align: center;
            margin: 28px 0;
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
            
            .hero h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${LOGO_URL}" alt="TripShare" class="logo" />
          </div>
          
          <div class="hero">
            <h1>Password Reset Request</h1>
            <p>Secure your TripShare account</p>
          </div>
          
          <div class="content">
            <p class="welcome-text">Hello, ${name}</p>
            <p class="message">
              We received a request to reset the password for your TripShare account. 
              Please click the button below to create a new password:
            </p>
            
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p class="message">
              If you did not request a password reset, please ignore this email or contact 
              our support team if you have concerns.
            </p>
            
            <div class="note">
              <p><strong>Important:</strong> This password reset link will expire in ${expiresIn}.</p>
              <p>For security reasons, please do not share this email with anyone.</p>
            </div>
            
            <p class="message">
              If the button above doesn't work, you can copy and paste the following link into your browser:
            </p>
            
            <div class="link-container">
              ${resetUrl}
            </div>
          </div>
          
          <div class="footer">
            <p>Safe travels,</p>
            <p>The TripShare Team</p>
            <p>&copy; ${new Date().getFullYear()} TripShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function passwordResetSuccessTemplate({ name, loginUrl }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset Successful - TripShare</title>
        <style>
          /* Base styles */
          :root {
            --primary: #4ade80;
            --primary-dark: #22c55e;
            --success: #10b981;
            --success-dark: #059669;
            --danger: #ef4444;
            --danger-light: #fee2e2;
            --secondary: #333333;
            --light-bg: #f9fafb;
            --border: #e5e7eb;
            --text-dark: #1f2937;
            --text-medium: #4b5563;
            --text-light: #6b7280;
            --danger-text: #b91c1c;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: var(--text-dark);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          
          /* Container */
          .container {
            max-width: 580px;
            margin: 24px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          
          /* Header */
          .header {
            padding: 24px;
            text-align: center;
            border-bottom: 1px solid var(--border);
          }
          
          .logo {
            height: 40px;
            width: auto;
          }
          
          /* Hero section */
          .hero {
            background-color: var(--success);
            padding: 36px 24px;
            text-align: center;
          }
          
          .hero h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
          
          .hero p {
            color: #ffffff;
            margin: 12px 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          
          /* Content */
          .content {
            padding: 32px 28px;
          }
          
          .welcome-text {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--text-dark);
          }
          
          .message {
            margin-bottom: 16px;
            color: var(--text-medium);
            font-size: 15px;
          }
          
          /* Security notice */
          .security-notice {
            margin-top: 24px;
            padding: 16px;
            background-color: var(--danger-light);
            border-radius: 6px;
            color: var(--danger-text);
            font-size: 14px;
            border-left: 3px solid var(--danger);
          }
          
          .security-notice p {
            margin: 0;
          }
          
          /* Footer */
          .footer {
            background-color: var(--light-bg);
            padding: 24px;
            text-align: center;
            border-top: 1px solid var(--border);
          }
          
          .footer p {
            margin: 4px 0;
            font-size: 13px;
            color: var(--text-light);
          }
          
          /* Button */
          .button {
            display: inline-block;
            background-color: var(--success);
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.2s ease;
          }
          
          .button:hover {
            background-color: var(--success-dark);
            transform: translateY(-1px);
          }
          
          .button-container {
            text-align: center;
            margin: 28px 0;
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
            
            .hero h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${LOGO_URL}" alt="TripShare" class="logo" />
          </div>
          
          <div class="hero">
            <h1>Password Reset Successful</h1>
            <p>Your account is now secure</p>
          </div>
          
          <div class="content">
            <p class="welcome-text">Hello, ${name}</p>
            <p class="message">
              Your TripShare password has been successfully reset.
            </p>
            <p class="message">
              You can now log in to your account with your new password.
            </p>
            
            <div class="button-container">
              <a href="${loginUrl || 'https://yourtripshare.com/login'}" class="button">Go to Login</a>
            </div>
            
            <div class="security-notice">
              <p><strong>Important Security Notice:</strong> If you did not request this password change, please contact our support team immediately as your account may have been compromised.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Safe travels,</p>
            <p>The TripShare Team</p>
            <p>&copy; ${new Date().getFullYear()} TripShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}