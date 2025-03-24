const nodemailer = require("nodemailer");
async function sendMail({ from, to, subject, text, html }) {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER, // generated user
      pass: process.env.MAIL_PASSWORD, // generated password
    },
  });

  let info = await transporter.sendMail({
    from: `inShare <${from}>`,
    to,
    subject,
    text,
    html
  });
  console.log(info);
}

module.exports = sendMail;
