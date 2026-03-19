const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "FuelPass OTP Login",
    html: `
      <h2>FuelPass Login OTP</h2>
      <p>Your OTP is:</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordEmail = async (to, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "FuelPass Station - New Password",
    html: `
      <h2>FuelPass Station Password Reset</h2>
      <p>Your password reset request has been approved by the Admin.</p>
      <p>Your new password is:</p>
      <h1 style="letter-spacing: 4px;">${password}</h1>
      <p>Please use this to log into the Fuel Station portal.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendPasswordEmail };