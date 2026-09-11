require("dotenv").config();
const nodemailer = require("nodemailer");

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: (process.env.EMAIL_PASS || "").replace(/\s+/g, ""),
    },
  });
};

const sendOtpEmail = async (to, otp) => {
  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === "your_email@gmail.com" ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === "your_email_app_password"
  ) {
    console.warn("⚠️ Email credentials not configured in backend/.env.");
    return;
  }

  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `"FuelPass National Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject: "FuelPass Login OTP Verification",
      html: `
        <div style="margin: 0; padding: 30px 10px; background-color: #070B14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #0F172A; border-radius: 20px; border: 1px solid #1E293B; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
            
            <!-- HEADER -->
            <tr>
              <td style="padding: 28px 24px 20px 24px; text-align: center; background: linear-gradient(135deg, #06B6D4 0%, #2563EB 100%);">
                <div style="font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; margin: 0;">
                  ⛽ FuelPass
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #E0F2FE; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">
                  National Fuel Quota Portal
                </div>
              </td>
            </tr>

            <!-- CONTENT BODY -->
            <tr>
              <td style="padding: 32px 28px 24px 28px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #FFFFFF;">
                  Verification Code
                </h2>
                <p style="margin: 0 0 24px 0; font-size: 13px; color: #94A3B8; line-height: 1.6;">
                  Use the one-time verification code below to securely sign into your FuelPass vehicle account.
                </p>

                <!-- OTP BOX -->
                <div style="background-color: #070B14; border: 2px solid #06B6D4; border-radius: 14px; padding: 18px 20px; margin: 0 auto 24px auto; text-align: center; max-width: 260px;">
                  <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #22D3EE; font-family: monospace; display: inline-block;">
                    ${otp}
                  </span>
                </div>

                <!-- EXPIRY & NOTICE -->
                <div style="background-color: rgba(245, 158, 11, 0.08); border-left: 3px solid #F59E0B; border-radius: 6px; padding: 10px 14px; text-align: left; margin-bottom: 20px;">
                  <div style="font-size: 12px; font-weight: 600; color: #FCD34D;">
                    ⏱️ Code valid for 5 minutes
                  </div>
                  <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">
                    Please do not share this OTP with anyone for account security.
                  </div>
                </div>

                <p style="margin: 0; font-size: 11px; color: #64748B;">
                  If you didn't request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding: 16px 24px; text-align: center; font-size: 11px; color: #64748B; background-color: #070B14; border-top: 1px solid #1E293B;">
                © 2026 Ministry of Power & Energy, Sri Lanka • FuelPass System
              </td>
            </tr>

          </table>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email successfully sent to ${to} (MessageID: ${info.messageId})`);
  } catch (emailErr) {
    console.error("❌ Failed to send OTP email via SMTP:", emailErr.message);
  }
};

const sendPasswordEmail = async (to, password, stationId, stationName) => {
  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === "your_email@gmail.com" ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === "your_email_app_password"
  ) {
    console.warn("⚠️ Email credentials not configured in backend/.env.");
    return;
  }

  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `"FuelPass Administration" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🔑 FuelPass Station - Password Reset Approved (${stationId || 'Station'})`,
      html: `
        <div style="margin: 0; padding: 30px 10px; background-color: #070B14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #0F172A; border-radius: 20px; border: 1px solid #1E293B; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
            
            <!-- HEADER -->
            <tr>
              <td style="padding: 28px 24px 20px 24px; text-align: center; background: linear-gradient(135deg, #10B981 0%, #059669 100%);">
                <div style="font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; margin: 0;">
                  🔑 Password Reset Approved
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #D1FAE5; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">
                  FuelPass Station Operator Portal
                </div>
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td style="padding: 32px 28px 24px 28px;">
                <div style="font-size: 16px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">
                  Hello, ${stationName || stationId || 'Station Operator'} 👋
                </div>
                <p style="margin: 0 0 20px 0; font-size: 13px; color: #94A3B8; line-height: 1.6;">
                  Your password reset request for Station <strong>${stationId || ''}</strong> has been approved by the Administrator. Use the temporary password below to log in:
                </p>

                <!-- CREDENTIALS BOX -->
                <div style="background-color: #070B14; border: 1px solid #1E293B; border-radius: 14px; padding: 20px; margin-bottom: 20px; text-align: center;">
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94A3B8; letter-spacing: 1px; margin-bottom: 8px;">
                    Temporary 6-Digit Password:
                  </div>
                  <div style="background-color: #10B981; color: #FFFFFF; padding: 8px 18px; border-radius: 10px; font-size: 24px; letter-spacing: 6px; font-weight: 900; display: inline-block; font-family: monospace;">
                    ${password}
                  </div>
                </div>

                <div style="background-color: rgba(59, 130, 246, 0.08); border-left: 3px solid #3B82F6; border-radius: 6px; padding: 12px 14px; margin-bottom: 16px;">
                  <div style="font-size: 12px; font-weight: 600; color: #93C5FD;">
                    🔒 Security Notice:
                  </div>
                  <div style="font-size: 11px; color: #94A3B8; margin-top: 3px; line-height: 1.5;">
                    You will be prompted immediately to choose a permanent, secure password upon your first login.
                  </div>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding: 16px 24px; text-align: center; font-size: 11px; color: #64748B; background-color: #070B14; border-top: 1px solid #1E293B;">
                © 2026 FuelPass National Management System. Sri Lanka.
              </td>
            </tr>

          </table>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Approved password reset email sent to ${to} (MessageID: ${info.messageId})`);
  } catch (emailErr) {
    console.error("❌ Failed to send approved password email via SMTP:", emailErr.message);
  }
};

const sendPasswordResetRejectionEmail = async (to, stationId, stationName) => {
  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === "your_email@gmail.com" ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === "your_email_app_password"
  ) {
    console.warn("⚠️ Email credentials not configured in backend/.env.");
    return;
  }

  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `"FuelPass Administration" <${process.env.EMAIL_USER}>`,
      to,
      subject: `❌ FuelPass Station - Password Reset Request Rejected (${stationId || 'Station'})`,
      html: `
        <div style="margin: 0; padding: 30px 10px; background-color: #070B14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #0F172A; border-radius: 20px; border: 1px solid #1E293B; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
            
            <!-- HEADER -->
            <tr>
              <td style="padding: 28px 24px 20px 24px; text-align: center; background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);">
                <div style="font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; margin: 0;">
                  Request Rejected
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #FEE2E2; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">
                  FuelPass Security Notice
                </div>
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td style="padding: 32px 28px 24px 28px;">
                <div style="font-size: 16px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">
                  Hello, ${stationName || stationId || 'Station Operator'}
                </div>
                <p style="margin: 0 0 20px 0; font-size: 13px; color: #94A3B8; line-height: 1.6;">
                  We are writing to inform you that your password reset request for Station <strong>${stationId || ''}</strong> has been <strong>rejected</strong> by the System Administrator.
                </p>

                <div style="background-color: rgba(239, 68, 68, 0.08); border-left: 3px solid #EF4444; border-radius: 6px; padding: 12px 14px; margin-bottom: 16px;">
                  <div style="font-size: 12px; font-weight: 700; color: #FCA5A5;">
                    ⚠️ Verification Notice:
                  </div>
                  <div style="font-size: 11px; color: #E2E8F0; margin-top: 3px; line-height: 1.5;">
                    The operator verification details provided did not match Ministry records.
                  </div>
                </div>

                <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                  If you need assistance, please contact the FuelPass National Administrative Support desk with valid station ownership documentation.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding: 16px 24px; text-align: center; font-size: 11px; color: #64748B; background-color: #070B14; border-top: 1px solid #1E293B;">
                © 2026 FuelPass National Management System. Sri Lanka.
              </td>
            </tr>

          </table>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Rejection notification email sent to ${to} (MessageID: ${info.messageId})`);
  } catch (emailErr) {
    console.error("❌ Failed to send rejection email via SMTP:", emailErr.message);
  }
};

const sendStationCredentialsEmail = async (to, stationId, stationName, password) => {
  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === "your_email@gmail.com" ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_PASS === "your_email_app_password"
  ) {
    console.warn("⚠️ Email credentials not configured in backend/.env.");
    return;
  }

  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `"FuelPass Administration" <${process.env.EMAIL_USER}>`,
      to,
      subject: `⛽ FuelPass Station Account Created - ${stationId}`,
      html: `
        <div style="margin: 0; padding: 30px 10px; background-color: #070B14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #0F172A; border-radius: 20px; border: 1px solid #1E293B; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
            
            <!-- HEADER -->
            <tr>
              <td style="padding: 28px 24px 20px 24px; text-align: center; background: linear-gradient(135deg, #FF6B00 0%, #D946EF 100%);">
                <div style="font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; margin: 0;">
                  ⛽ Station Account Created
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #FFE4E6; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">
                  Station Operator Access
                </div>
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td style="padding: 32px 28px 24px 28px;">
                <div style="font-size: 16px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">
                  Welcome, ${stationName || stationId}! 👋
                </div>
                <p style="margin: 0 0 20px 0; font-size: 13px; color: #94A3B8; line-height: 1.6;">
                  Your fuel station operator account has been activated in the National FuelPass System. Use the credentials below to log into the Fuel Station Portal:
                </p>

                <!-- CREDENTIALS TABLE -->
                <div style="background-color: #070B14; border: 1px solid #1E293B; border-radius: 14px; padding: 18px 20px; margin-bottom: 20px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">
                        Station ID / Username:
                      </td>
                      <td style="padding: 6px 0; font-size: 15px; font-weight: 800; color: #38BDF8; font-family: monospace; text-align: right;">
                        ${stationId}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">
                        Station Name:
                      </td>
                      <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #F8FAFC; text-align: right;">
                        ${stationName || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0 4px 0; font-size: 12px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">
                        Temporary Password:
                      </td>
                      <td style="padding: 10px 0 4px 0; text-align: right;">
                        <span style="background-color: #FF6B00; color: #FFFFFF; padding: 4px 12px; border-radius: 8px; font-size: 18px; letter-spacing: 4px; font-weight: 900; font-family: monospace; display: inline-block;">
                          ${password}
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>

                <div style="background-color: rgba(217, 70, 239, 0.08); border-left: 3px solid #D946EF; border-radius: 6px; padding: 12px 14px;">
                  <div style="font-size: 12px; font-weight: 600; color: #F0ABFC;">
                    🔒 First-Time Security Policy:
                  </div>
                  <div style="font-size: 11px; color: #94A3B8; margin-top: 3px; line-height: 1.5;">
                    When you log in with this 6-digit temporary password, you will be prompted immediately to set your new permanent password.
                  </div>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding: 16px 24px; text-align: center; font-size: 11px; color: #64748B; background-color: #070B14; border-top: 1px solid #1E293B;">
                © 2026 FuelPass National Management System. Sri Lanka.
              </td>
            </tr>

          </table>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Station credentials successfully emailed to ${to} (MessageID: ${info.messageId})`);
  } catch (emailErr) {
    console.error("❌ Failed to send station credentials email via SMTP:", emailErr.message);
  }
};

module.exports = { 
  sendOtpEmail, 
  sendPasswordEmail, 
  sendPasswordResetRejectionEmail, 
  sendStationCredentialsEmail 
};