const nodemailer = require('nodemailer');

/**
 * Send an email notification using SMTP.
 * Falls back to console output if credentials are not configured.
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const smtpEmail = process.env.SMTP_EMAIL || 'quockhanh5171017@gmail.com';
        const smtpPassword = process.env.SMTP_PASSWORD || 'atjw hciw ayks wtxb';

        if (!smtpEmail || !smtpPassword) {
            console.log('⚠️ SMTP Credentials missing, skipping email sending.');
            console.log(`✉️ Mock email that would have been sent to: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body excerpt: ${html.substring(0, 250)}...`);
            return { success: false, reason: 'Credentials missing' };
        }

        // Configure standard Gmail transporter using user provided credentials
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtpEmail,
                pass: smtpPassword
            }
        });

        const mailOptions = {
            from: `"Hệ thống Real-time Notification" <${smtpEmail}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Notification email sent successfully to:', to, 'Info ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending notification email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail
};
