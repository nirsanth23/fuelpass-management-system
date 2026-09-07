const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp) => {
  console.log(`\n========================================`);
  console.log(`🔑 [DEV OTP] For ${to} -> OTP is: ${otp}`);
  console.log(`========================================\n`);

  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === "your_email@gmail.com" ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === "your_email_app_password"
  ) {
    console.log("ℹ️ Email credentials not configured in backend/.env. Use the above console OTP.");
    return;
  }

  try {
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
    console.log(`📧 OTP email successfully sent to ${to}`);
  } catch (emailErr) {
    console.warn("⚠️ Failed to send email via SMTP (Check your Gmail App Password). Use the console OTP above.");
  }
};

const sendPasswordEmail = async (to, password, stationId, stationName) => {
  console.log(`\n========================================`);
  console.log(`🔑 [PASSWORD RESET APPROVED]`);
  console.log(`To: ${to}`);
  console.log(`Station: ${stationId} (${stationName || 'N/A'})`);
  console.log(`Temporary 6-Digit Password: ${password}`);
  console.log(`========================================\n`);

  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === "your_email@gmail.com" ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === "your_email_app_password"
  ) {
    console.log("ℹ️ Email credentials not configured in backend/.env. Use the above console password.");
    return;
  }

  try {
    const mailOptions = {
      from: `"FuelPass Administration" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🔑 FuelPass Station - Password Reset Approved (${stationId || 'Station'})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background-color: #0B1220; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; }
            .container { max-width: 560px; margin: 40px auto; background-color: #16213A; border-radius: 16px; border: 1px solid #2A3B5C; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 1px; }
            .header p { margin: 6px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; }
            .content { padding: 32px 28px; }
            .greeting { font-size: 18px; font-weight: 600; color: #FFFFFF; margin-bottom: 12px; }
            .desc { font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }
            .cred-card { background: rgba(255, 255, 255, 0.04); border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center; }
            .label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; display: block; margin-bottom: 8px; }
            .badge-pw { background: #10B981; color: #FFFFFF; padding: 8px 18px; border-radius: 10px; font-size: 24px; letter-spacing: 6px; font-weight: 800; display: inline-block; font-family: monospace; }
            .notice-box { background: rgba(245, 158, 11, 0.1); border-left: 4px solid #F59E0B; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; }
            .notice-box p { margin: 0; font-size: 13px; color: #FCD34D; line-height: 1.5; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748B; background-color: #0F172A; border-top: 1px solid #1E293B; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Approved</h1>
              <p>FuelPass Station Portal</p>
            </div>
            <div class="content">
              <div class="greeting">Hello, ${stationName || stationId || 'Station Operator'} 👋</div>
              <div class="desc">Your password reset request for Station <strong>${stationId || ''}</strong> has been approved by the Admin. Use the 6-digit temporary password below to log in:</div>
              
              <div class="cred-card">
                <span class="label">Temporary 6-Digit Password:</span>
                <div><span class="badge-pw">${password}</span></div>
              </div>

              <div class="notice-box">
                <p>🔒 <strong>First-Time Security Policy:</strong> When you log in with this 6-digit password, you will be prompted immediately to set your new permanent password (containing letters, numbers, and special characters).</p>
              </div>
            </div>
            <div class="footer">
              © 2026 FuelPass National Management System. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Approved password reset email sent to ${to}`);
  } catch (emailErr) {
    console.warn("⚠️ Failed to send approved password email via SMTP:", emailErr.message);
  }
};

const sendPasswordResetRejectionEmail = async (to, stationId, stationName) => {
  console.log(`\n========================================`);
  console.log(`❌ [PASSWORD RESET REJECTED]`);
  console.log(`To: ${to}`);
  console.log(`Station: ${stationId} (${stationName || 'N/A'})`);
  console.log(`Status: Request Rejected by Admin`);
  console.log(`========================================\n`);

  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === "your_email@gmail.com" ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === "your_email_app_password"
  ) {
    console.log("ℹ️ Email credentials not configured in backend/.env.");
    return;
  }

  try {
    const mailOptions = {
      from: `"FuelPass Administration" <${process.env.EMAIL_USER}>`,
      to,
      subject: `❌ FuelPass Station - Password Reset Request Rejected (${stationId || 'Station'})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background-color: #0B1220; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; }
            .container { max-width: 560px; margin: 40px auto; background-color: #16213A; border-radius: 16px; border: 1px solid #2A3B5C; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 1px; }
            .header p { margin: 6px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; }
            .content { padding: 32px 28px; }
            .greeting { font-size: 18px; font-weight: 600; color: #FFFFFF; margin-bottom: 12px; }
            .desc { font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }
            .reject-card { background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
            .reject-card h4 { margin: 0 0 8px 0; color: #FCA5A5; font-size: 15px; font-weight: 700; }
            .reject-card p { margin: 0; color: #E2E8F0; font-size: 13px; line-height: 1.5; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748B; background-color: #0F172A; border-top: 1px solid #1E293B; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Request Status: Rejected</h1>
              <p>FuelPass Station Portal Security</p>
            </div>
            <div class="content">
              <div class="greeting">Hello, ${stationName || stationId || 'Station Operator'}</div>
              <div class="desc">We are writing to inform you that your password reset request for Station <strong>${stationId || ''}</strong> has been <strong>rejected</strong> by the System Administrator.</div>
              
              <div class="reject-card">
                <h4>⚠️ Security Verification Notice</h4>
                <p>The information submitted did not match official operator verification records, or the request was marked as unauthorized.</p>
              </div>

              <div class="desc">If you believe this is an error or need immediate access to your station account, please contact the FuelPass National Administrative Support desk or your regional coordinator with valid station documentation.</div>
            </div>
            <div class="footer">
              © 2026 FuelPass National Management System. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Rejection notification email sent to ${to}`);
  } catch (emailErr) {
    console.warn("⚠️ Failed to send rejection email via SMTP:", emailErr.message);
  }
};

const sendStationCredentialsEmail = async (to, stationId, stationName, password) => {
  console.log(`\n========================================`);
  console.log(`⛽ [STATION CREDENTIALS]`);
  console.log(`To: ${to}`);
  console.log(`Station Name: ${stationName}`);
  console.log(`Username (Station ID): ${stationId}`);
  console.log(`Temporary Password: ${password}`);
  console.log(`========================================\n`);

  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === "your_email@gmail.com" ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === "your_email_app_password"
  ) {
    console.log("ℹ️ Email credentials not configured in backend/.env. Use the above console credentials.");
    return;
  }

  try {
    const mailOptions = {
      from: `"FuelPass Administration" <${process.env.EMAIL_USER}>`,
      to,
      subject: `⛽ FuelPass Station Account Created - ${stationId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background-color: #0B1220; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; }
            .container { max-width: 560px; margin: 40px auto; background-color: #16213A; border-radius: 16px; border: 1px solid #2A3B5C; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #FF6B00 0%, #D946EF 100%); padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: 1px; }
            .header p { margin: 6px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; }
            .content { padding: 32px 28px; }
            .greeting { font-size: 18px; font-weight: 600; color: #FFFFFF; margin-bottom: 12px; }
            .desc { font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px; }
            .cred-card { background: rgba(255, 255, 255, 0.04); border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
            .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
            .cred-row:last-child { border-bottom: none; }
            .label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; }
            .value { font-size: 16px; font-weight: 700; color: #F8FAFC; font-family: monospace; }
            .badge-pw { background: #FF6B00; color: #FFFFFF; padding: 6px 14px; border-radius: 8px; font-size: 20px; letter-spacing: 4px; font-weight: 800; display: inline-block; }
            .notice-box { background: rgba(217, 70, 239, 0.1); border-left: 4px solid #D946EF; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; }
            .notice-box p { margin: 0; font-size: 13px; color: #F0ABFC; line-height: 1.5; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748B; background-color: #0F172A; border-top: 1px solid #1E293B; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FuelPass Management</h1>
              <p>Station Operator Portal Access</p>
            </div>
            <div class="content">
              <div class="greeting">Welcome, ${stationName || stationId}! 👋</div>
              <div class="desc">Your fuel station operator account has been registered in the National FuelPass System. Use the credentials below to log into the Fuel Station Portal.</div>
              
              <div class="cred-card">
                <div class="cred-row">
                  <span class="label">Station ID / Username:</span>
                  <span class="value" style="color: #38BDF8;">${stationId}</span>
                </div>
                <div class="cred-row">
                  <span class="label">Station Name:</span>
                  <span class="value">${stationName || 'N/A'}</span>
                </div>
                <div class="cred-row" style="margin-top: 8px;">
                  <span class="label">Temporary Password:</span>
                  <div><span class="badge-pw">${password}</span></div>
                </div>
              </div>

              <div class="notice-box">
                <p>🔒 <strong>First-Time Security Policy:</strong> When you log in with this 6-digit temporary password, you will be prompted to set a permanent, secure password (containing letters, numbers, and special characters).</p>
              </div>
            </div>
            <div class="footer">
              © 2026 FuelPass National Management System. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Station credentials successfully emailed to ${to}`);
  } catch (emailErr) {
    console.warn("⚠️ Failed to send station credentials email via SMTP:", emailErr.message);
  }
};

module.exports = { 
  sendOtpEmail, 
  sendPasswordEmail, 
  sendPasswordResetRejectionEmail, 
  sendStationCredentialsEmail 
};