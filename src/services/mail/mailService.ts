import  dotenv from 'dotenv';
import nodemailer, { Transporter } from 'nodemailer';
dotenv.config();
export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'asmtp.dandomain.dk', // Dandomain SMTP server
      port: 587, // Port for STARTTLS
      secure: false, // Must be `false` for STARTTLS on port 587
      auth: {
        user: process.env.SMTP_USER, // Your full email address
        pass: process.env.SMTP_PASS, // Your email password
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates if needed
      },
      logger: false,  // Enable logs
      debug: false,   // Debugging mode
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"Smartphoneshop" <${process.env.SMTP_USER}>`, // Your email
        to,
        subject,
        text,
        html,
      });

      console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
