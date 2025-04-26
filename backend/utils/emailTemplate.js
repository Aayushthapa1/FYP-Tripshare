
const LOGO_URL = 'https://i.pinimg.com/736x/cf/94/64/cf94645fcdbd6a1bedbea858f2e89e95.jpg'
// Update the resetPasswordEmailTemplate function to match the home page dark theme
export function resetPasswordEmailTemplate({ name, resetUrl, expiresIn }) {
  const currentYear = new Date().getFullYear()

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your TripShare Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; color: #1f2937; line-height: 1.6; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 580px; margin: 24px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header with Logo -->
          <div style="padding: 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <img src="${LOGO_URL}" alt="TripShare" style="height: 40px; width: auto; display: inline-block;" />
          </div>
          
          <!-- Hero Section -->
          <div style="background-color: #1c1c1c; background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'); background-size: cover; background-position: center; padding: 48px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.02em;">Password Reset Request</h1>
            <p style="color: #4ade80; margin: 12px 0 0; font-size: 18px; font-weight: 500;">Secure your TripShare account</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 36px 32px;">
            <p style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #1f2937;">Hello, ${name}</p>
            <p style="margin-bottom: 20px; color: #4b5563; font-size: 16px; line-height: 1.7;">
              We received a request to reset the password for your TripShare account. 
              Please click the button below to create a new password:
            </p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #4ade80; color: #1c1c1c; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Reset Password</a>
            </div>
            
            <p style="margin-bottom: 20px; color: #4b5563; font-size: 16px; line-height: 1.7;">
              If you did not request a password reset, please ignore this email or contact 
              our support team if you have concerns.
            </p>
            
            <!-- Note -->
            <div style="font-size: 15px; color: #4b5563; margin-top: 28px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #4ade80;">
              <p style="margin: 0 0 10px 0;"><strong>Important:</strong> This password reset link will expire in ${expiresIn}.</p>
              <p style="margin: 0;">For security reasons, please do not share this email with anyone.</p>
            </div>
            
            <p style="margin: 20px 0; color: #4b5563; font-size: 16px; line-height: 1.7;">
              If the button above doesn't work, you can copy and paste the following link into your browser:
            </p>
            
            <!-- Link Container -->
            <div style="margin: 16px 0; word-break: break-all; background-color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 14px; color: #4b5563;">
              ${resetUrl}
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #1c1c1c; padding: 28px; text-align: center; border-top: 1px solid #333;">
            <p style="margin: 4px 0; font-size: 14px; color: #e5e7eb;">Safe travels,</p>
            <p style="margin: 4px 0; font-size: 14px; color: #e5e7eb;">The TripShare Team</p>
            <p style="margin: 12px 0 4px; font-size: 14px; color: #9ca3af;">&copy; ${currentYear} TripShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Update the registrationEmailTemplate function to match the home page dark theme
export function registrationEmailTemplate({ name }) {
  const currentYear = new Date().getFullYear()

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to TripShare</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; color: #1f2937; line-height: 1.6; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 580px; margin: 24px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header with Logo -->
          <div style="padding: 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <img src="${LOGO_URL}" alt="TripShare" style="height: 40px; width: auto; display: inline-block;" />
          </div>
          
          <!-- Hero Section -->
          <div style="background-color: #1c1c1c; background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'); background-size: cover; background-position: center; padding: 48px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.02em;">Travel Together.</h1>
            <h2 style="color: #4ade80; margin: 8px 0 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em;">Save Together.</h2>
            <p style="color: #e5e7eb; margin: 16px 0 0; font-size: 16px; opacity: 0.9;">Join our community of travelers across the country</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 36px 32px;">
            <p style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #1f2937;">Hello, ${name}</p>
            <p style="margin-bottom: 20px; color: #4b5563; font-size: 16px; line-height: 1.7;">
              Thank you for joining TripShare! We're excited to help you connect with travelers, 
              save money, reduce emissions, and make new connections.
            </p>
            
            <!-- Info Box -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 28px; border-left: 4px solid #4ade80;">
              <p style="font-size: 15px; color: #4b5563; margin-bottom: 10px;">Your account has been successfully created and is ready to use.</p>
              <p style="font-size: 15px; color: #4b5563; margin-bottom: 0;">You can now start finding rides or offering your own trips to others.</p>
            </div>
            
            <!-- Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://yourtripshare.com/login" style="display: inline-block; background-color: #4ade80; color: #1c1c1c; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Get Started</a>
            </div>
            
            <p style="margin-bottom: 20px; color: #4b5563; font-size: 16px; line-height: 1.7;">
              If you have any questions or need assistance, our support team is always here to help.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #1c1c1c; padding: 28px; text-align: center; border-top: 1px solid #333;">
            <p style="margin: 4px 0; font-size: 14px; color: #e5e7eb;">Safe travels,</p>
            <p style="margin: 4px 0; font-size: 14px; color: #e5e7eb;">The TripShare Team</p>
            <p style="margin: 12px 0 4px; font-size: 14px; color: #9ca3af;">&copy; ${currentYear} TripShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Update the passwordResetSuccessTemplate function to match the home page dark theme
export function passwordResetSuccessTemplate({ name, loginUrl = "https://yourtripshare.com/login" }) {
  const currentYear = new Date().getFullYear()

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset Successful - TripShare</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; color: #1f2937; line-height: 1.6; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 580px; margin: 24px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header with Logo -->
          <div style="padding: 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <img src="${LOGO_URL}" alt="TripShare" style="height: 40px; width: auto; display: inline-block;" />
          </div>
          
          <!-- Hero Section -->
          <div style="background-color: #1c1c1c; background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'); background-size: cover; background-position: center; padding: 48px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.02em;">Password Reset Successful</h1>
            <p style="color: #4ade80; margin: 12px 0 0; font-size: 18px; font-weight: 500;">Your account is now secure</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 36px 32px;">
            <p style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #1f2937;">Hello, ${name}</p>
            <p style="margin-bottom: 20px; color: #4b5563; font-size: 16px; line-height: 1.7;">
              Your TripShare password has been successfully reset.
            </p>
            <p style="margin-bottom: 20px; color: #4b5563; font-size: 16px; line-height: 1.7;">
              You can now log in to your account with your new password.
            </p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}" style="display: inline-block; background-color: #4ade80; color: #1c1c1c; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Go to Login</a>
            </div>
            
            <!-- Security Notice -->
            <div style="margin-top: 28px; padding: 20px; background-color: #fee2e2; border-radius: 8px; color: #b91c1c; font-size: 15px; border-left: 4px solid #ef4444;">
              <p style="margin: 0;"><strong>Important Security Notice:</strong> If you did not request this password change, please contact our support team immediately as your account may have been compromised.</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #1c1c1c; padding: 28px; text-align: center; border-top: 1px solid #333;">
            <p style="margin: 4px 0; font-size: 14px; color: #e5e7eb;">Safe travels,</p>
            <p style="margin: 4px 0; font-size: 14px; color: #e5e7eb;">The TripShare Team</p>
            <p style="margin: 12px 0 4px; font-size: 14px; color: #9ca3af;">&copy; ${currentYear} TripShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
