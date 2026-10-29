import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(this.configService.get<string>('SMTP_PORT')) || 587;
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const user = this.configService.get<string>('SMTP_USER')?.trim();
    const pass = this.configService.get<string>('SMTP_PASS')?.trim();
    this.fromAddress =
      this.configService.get<string>('SMTP_FROM') ||
      '"Butterfly Smart TV" <no-reply@butterflytv.in>';

    if (user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
        });
        this.logger.log(`SMTP Mailer initialized successfully for ${user}@${host}:${port}`);
      } catch (err) {
        this.logger.error(`Failed to initialize SMTP transporter: ${err instanceof Error ? err.message : err}`);
      }
    } else {
      this.logger.warn(
        'SMTP_USER and/or SMTP_PASS not set in environment. Mailer running in developer fallback mode.',
      );
    }
  }

  async sendPasswordResetOtp(
    toEmail: string,
    otp: string,
    userName?: string,
  ): Promise<{ sent: boolean; devMode: boolean; error?: string }> {
    const recipientName = userName || 'Valued Customer';
    const subject = `Your Butterfly Smart TV Password Reset Code: ${otp}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="540px" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e4e4e7;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #18181b; padding: 28px 32px; text-align: left; border-bottom: 3px solid #E50914;">
                    <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">
                      BUTTERFLY <span style="color: #E50914; font-size: 13px; font-weight: 800; border: 1px solid #E50914; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">SMART TV</span>
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 32px 24px 32px;">
                    <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #18181b;">
                      Password Reset Verification
                    </h1>
                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #52525b;">
                      Hello <strong>${recipientName}</strong>,<br>
                      We received a request to reset the password for your Butterfly account (<strong>${toEmail}</strong>). Please use the One-Time Passcode (OTP) below to verify your request:
                    </p>

                    <!-- OTP Block -->
                    <div style="background-color: #fbfbfe; border: 2px dashed #E50914; border-radius: 12px; padding: 24px 16px; text-align: center; margin: 28px 0;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #71717a; margin-bottom: 8px;">
                        Your 6-Digit Verification Code
                      </div>
                      <div style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #18181b; font-family: 'Courier New', monospace;">
                        ${otp}
                      </div>
                      <div style="font-size: 12px; font-weight: 600; color: #dc2626; margin-top: 8px;">
                        ⏱ Valid for 10 minutes only
                      </div>
                    </div>

                    <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #71717a;">
                      Enter this code on the verification page before proceeding to set your new password.
                    </p>

                    <div style="background-color: #fffbeb; border-left: 3px solid #f59e0b; padding: 12px 14px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                        <strong>Security Reminder:</strong> Never share this code with anyone. Butterfly support staff will never ask you for your verification code. If you did not request this reset, your account is safe and you can safely ignore this email.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.5;">
                      Butterfly Smart TV Technologies &bull; Secure Authentication Service<br>
                      This is an automated security message. Please do not reply directly to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Developer console log banner
    this.logger.log(
      `\n=======================================================\n[BUTTERFLY AUTH] PASSWORD RESET OTP GENERATED\nRecipient: ${toEmail}\nOTP Code:  ${otp}\nValidity:  10 minutes\n=======================================================`,
    );

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromAddress,
          to: toEmail,
          subject,
          html,
          text: `Your Butterfly Smart TV password reset verification code is: ${otp}. It expires in 10 minutes.`,
        });
        this.logger.log(`Password reset OTP email sent successfully to ${toEmail}`);
        return { sent: true, devMode: false };
      } catch (err: any) {
        this.logger.error(`Error sending email to ${toEmail}: ${err?.message || err}`);
        return { sent: false, devMode: true, error: err?.message || 'SMTP transmission error' };
      }
    } else {
      return { sent: false, devMode: true };
    }
  }
}

