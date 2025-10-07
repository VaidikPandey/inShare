const nodemailer = require("nodemailer");

module.exports = async ({ from, to, subject, text, html }) => {
  try {
    // Brevo (Sendinblue) SMTP configuration
    let transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER, // Your Brevo email
        pass: process.env.MAIL_PASSWORD, // Your Brevo SMTP key
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `inShare <${process.env.FROM_EMAIL || process.env.MAIL_USER}>`, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    });
    
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};
