const nodemailer = require('nodemailer');

// configure transporter using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter verification failed:', error);
    } else {
        console.log('Email transporter is ready');
    }
});

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - recipient email (comma separated if multiple)
 * @param {string} options.subject - email subject
 * @param {string} options.text - plain text body
 * @param {string} [options.html] - optional html body
 * @returns {Promise}
 */
const sendEmail = async ({ to, subject, text, html }) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (err) {
        console.error('Error sending email:', err);
        throw err;
    }
};

module.exports = { sendEmail, transporter };