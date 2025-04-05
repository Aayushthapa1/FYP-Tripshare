import nodemailer from "nodemailer"
import { registrationEmailTemplate } from "./emailTemplate.js"

/**
 * Sends an email using Nodemailer.
 *
 * @param {Object} options
 * @param {string} options.to - The recipient's email address.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.template - The name of the email template to use ("registration" in this case).
 * @param {Object} options.context - Context data to render the template (e.g. { name: 'John Doe' }).
 * @returns {Promise<Object>} Nodemailer's info object.
 */
export async function sendEmail({ to, subject, template, context }) {
    // Create a transporter using your SMTP configuration.
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // Select the appropriate HTML template based on the "template" parameter.
    let html;
    switch (template) {
        case "registration":
            html = registrationEmailTemplate(context);
            break;
        // Add more cases for other templates if needed
        default:
            html = `<p>No template found for ${template}</p>`;
    }

    // Send mail with the defined transport object.
    const info = await transporter.sendMail({
        from: `"No Reply" <${process.env.EMAIL}>`,
        to,
        subject,
        html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
}

