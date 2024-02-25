import nodemailer from "nodemailer";

interface SendMailOpts {
  to: string;
  subject: string;
  html: string;
}

class MailService {
  private static _instance: MailService | undefined = undefined;

  /**
   * Get Instance
   * 
   * @returns {MailService}
   */
  public static getInstance(): MailService {
    if (!MailService._instance) {
      MailService._instance= new MailService();
    }
    return MailService._instance;
  }

  /**
   * Send Mail
   * @param {SendMailOpts} {to, subject, html} 
   * @returns 
   */
  public sendMail({ to, subject, html }: SendMailOpts): Promise<boolean> {
    const transporter: nodemailer.Transporter = nodemailer.createTransport({
      host: String(process.env.GMAIL_HOST),
      port: Number(process.env.GMAIL_PORT),
      secure: Boolean(process.env.GMAIL_SECURE === 'true' ? true : false), 
      auth: {
        user: String(process.env.GMAIL_AUTH_USER), 
        pass: String(process.env.GMAIL_AUTH_SECRET)
      }
    });

    return new Promise((resolve, reject) => {
      transporter.sendMail({
        to,
        subject,
        html,
      }, (error: Error | null, info: any) => {
        if (error) {
          return reject(false);
        }
        return resolve(true);
      });
    });
  }
}

export default MailService;