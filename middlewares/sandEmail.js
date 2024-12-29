const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure the transporter for sending emails via Gmail
const transporter = nodemailer.createTransport({
  service: "gmail", // Email service provider
  auth: {
    user: process.env.EMAIL_ADD,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send a welcome email to a new user
const newUserEmail = async (data) => {
  const { first_name, last_name, email, password } = data;

  // Subject of the welcome email
  const subject = `Welcome, ${first_name} ${last_name}!`;

  // HTML content of the welcome email
  const htmlContent = `
<p>Welcome to our website, ${first_name} ${last_name}!</p>
<p>Your account has been created successfully.</p>
<p>Click here to login: <a href="https://your_website_link">Login</a></p>
`;

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_ADD, // Sender's email
    to: email, // Recipient's email
    subject: subject, // Subject of the email
    html: htmlContent, // HTML content of the email
  };

  try {
    // Send the email using the transporter and return the result
    const emailResult = await transporter.sendMail(mailOptions);
    return emailResult;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

const sendResetEmail = async (value) => {
  console.log("sendResetEmail", value);
};

// Exporting the function for external use
module.exports = { newUserEmail, sendResetEmail };
