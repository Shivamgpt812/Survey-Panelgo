import nodemailer from 'nodemailer';

const user = process.env.SMTP_USER || 'pm.surveypanelgo@gmail.com';
const pass = (process.env.SMTP_PASS || 'dqfh xyve vixz dsjb').replace(/\s+/g, ''); // strip spaces from app password

export const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendOtpEmail(email: string, otp: string, panelName: string = 'Survey Panel Go'): Promise<boolean> {
  const mailOptions = {
    from: `"Survey Panel Go" <${user}>`,
    to: email,
    subject: `Your Verification Code for ${panelName}: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4fa; margin: 0; padding: 0; }
          .container { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 2px solid #1e1b4b; }
          .header { background: #6366f1; padding: 28px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .badge { display: inline-block; background: #fde047; color: #1e1b4b; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px; margin-top: 8px; text-transform: uppercase; }
          .body { padding: 32px 28px; color: #1e1b4b; }
          .body p { font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #334155; }
          .otp-box { background: #f1f5f9; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #4338ca; margin: 0; font-family: monospace; }
          .footer { background: #fafafa; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Survey Panel Go</h1>
            <div class="badge">${panelName}</div>
          </div>
          <div class="body">
            <p>Hello,</p>
            <p>Thank you for signing up to <strong>${panelName}</strong>. Please use the verification code below to confirm your account and complete your onboarding profile:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p>This code will expire in <strong>10 minutes</strong>. If you did not request this code, please disregard this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Survey Panel Go. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error);
    return false;
  }
}
