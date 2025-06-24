import * as nodemailer from "nodemailer";
import path from "path";
import config from "./config";
import logger from "./utilities/logger";
import handlebars from "handlebars";
import fs from "fs";
import { EmailTemplate } from "./types/email/email.types";
import { AppError } from "./errors/app.error";

export class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.mailHost,
      port: config.email.mailPort,
      secure: false,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass,
      },
      from: config.email.mailFrom,
    });
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(
      __dirname,
      "../templates/emails",
      `${templateName}.hbs`
    );
    return fs.promises.readFile(templatePath, "utf-8");
  }

  private compileTemplate(
    templateSource: string,
    context: Record<string, any>
  ): string {
    const template = handlebars.compile(templateSource);
    return template(context);
  }

  async sendEmail(emailData: EmailTemplate): Promise<void> {
    try {
      // Load and compile template
      const templateSource = await this.loadTemplate(emailData.template);
      const htmlContent = this.compileTemplate(
        templateSource,
        emailData.context
      );

      // Send email
      const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@yourapp.com",
        to: emailData.to,
        subject: emailData.subject,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully: ${result.messageId}`);
    } catch (error) {
      logger.error("Error sending email:", error);
      throw new AppError("Failed to send email", 500);
    }
  }
}
