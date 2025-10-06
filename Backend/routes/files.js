const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../services/emailService");
const emailTemplate = require("../services/emailTemplate");

// Configure storage
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Block dangerous file types
  const dangerousExtensions = [".exe", ".bat", ".cmd", ".sh", ".app"];
  const fileExt = path.extname(file.originalname).toLowerCase();

  if (dangerousExtensions.includes(fileExt)) {
    return cb(
      new Error("This file type is not allowed for security reasons."),
      false,
    );
  }
  cb(null, true);
};

let upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 }, // 100mb
  fileFilter,
}).single("myfile");

// Upload endpoint
router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    // Handle multer errors
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .send({ error: "File size exceeds 100MB limit." });
      }
      return res.status(400).send({ error: err.message });
    } else if (err) {
      return res.status(400).send({ error: err.message });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded." });
    }

    try {
      const file = new File({
        filename: req.file.filename,
        uuid: uuidv4(),
        path: req.file.path,
        size: req.file.size,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const response = await file.save();
      res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
    } catch (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .send({ error: "Failed to save file information." });
    }
  });
});

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Send email endpoint
router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom, emailFromName } = req.body;

  // Validate required fields
  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "All fields are required." });
  }

  // Validate email formats
  if (!isValidEmail(emailTo)) {
    return res.status(422).send({ error: "Invalid recipient email address." });
  }

  if (!isValidEmail(emailFrom)) {
    return res.status(422).send({ error: "Invalid sender email address." });
  }

  try {
    // Get file from database
    const file = await File.findOne({ uuid: uuid });

    if (!file) {
      return res.status(404).send({ error: "File not found." });
    }

    // Check if email already sent
    if (file.sender) {
      return res.status(422).send({ error: "Email already sent once." });
    }

    // Update file with sender/receiver info
    file.sender = emailFrom;
    file.receiver = emailTo;
    await file.save();

    // Prepare email content
    const downloadLink = `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`;
    const fileSizeKB = Math.round(file.size / 1000);
    const senderName = emailFromName || emailFrom.split("@")[0];

    // Send email
    try {
      await sendMail({
        from: emailFrom,
        to: emailTo,
        subject: "inShare - File shared with you",
        text: `${emailFrom} shared a file with you. Download it here: ${downloadLink}`,
        html: emailTemplate({
          emailFrom,
          downloadLink,
          size: fileSizeKB + " KB",
          expires: "24 hours",
        }),
        userName: senderName,
      });

      console.log(`Email sent successfully from ${emailFrom} to ${emailTo}`);
      return res.json({ success: true });
    } catch (emailError) {
      console.error("Email sending error:", emailError);

      // Revert database changes if email fails
      file.sender = undefined;
      file.receiver = undefined;
      await file.save();

      return res.status(500).json({
        error: "Failed to send email. Please try again.",
        details:
          process.env.NODE_ENV === "development"
            ? emailError.message
            : undefined,
      });
    }
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).send({
      error: "Something went wrong.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
