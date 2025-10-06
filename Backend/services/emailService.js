const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail({ from, to, subject, text, html, userName }) {
  try {
    // Use the sender's name in the display, but email from verified domain
    const senderName = userName || from?.split("@")[0] || "inShare User";

    const { data, error } = await resend.emails.send({
      from: `${senderName} via inShare <${process.env.MAIL_FROM}>`,
      reply_to: from, // Replies go to the original sender
      to: [to],
      subject: subject,
      text: text,
      html: html,
    });

    if (error) {
      console.error("Email sending failed:", error);
      throw error;
    }

    console.log("Email sent successfully:", data.id);
    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

module.exports = sendMail;
