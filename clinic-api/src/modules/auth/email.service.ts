import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Create email transporter
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      this.logger.warn('SMTP credentials are missing. Email sending will fail.');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  }

  async sendOtpEmail(email: string, otpCode: string): Promise<void> {
    const mailOptions = {
      from: `"تاج أزال" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'رمز إعادة تعيين كلمة السر',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; text-align: center;">رمز إعادة تعيين كلمة السر</h2>
          <p>مرحباً،</p>
          <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك في تطبيق تاج أزال.</p>
          <p>رمز التحقق الخاص بك هو:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #2563eb; background-color: #f3f4f6; padding: 15px 30px; border-radius: 8px; letter-spacing: 4px;">
              ${otpCode}
            </span>
          </div>
          <p>هذا الرمز صالح لمدة 10 دقائق فقط.</p>
          <p>إذا لم تقم بطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            إذا كان لديك أي أسئلة، يرجى التواصل معنا.
          </p>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            تاج أزال - نظام إدارة العيادات
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send OTP email to ${email}: ${error.message}`, error.stack);

      if (error.code === 'EAUTH') {
        throw new InternalServerErrorException('فشل في تسجيل الدخول لخادم البريد. يرجى التحقق من إعدادات SMTP.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new InternalServerErrorException('لا يمكن الاتصال بخادم البريد. يرجى التحقق من Host/Port.');
      }

      throw new InternalServerErrorException('فشل في إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.');
    }
  }

  async sendPasswordResetConfirmation(email: string): Promise<void> {
    const mailOptions = {
      from: `"تاج أزال" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'تم تغيير كلمة السر بنجاح',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669; text-align: center;">تم تغيير كلمة السر بنجاح</h2>
          <p>مرحباً،</p>
          <p>تم تغيير كلمة المرور الخاصة بك في تطبيق تاج أزال بنجاح.</p>
          <p>إذا لم تقم أنت بإجراء هذا التغيير، يرجى التواصل معنا فوراً.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            إذا كان لديك أي أسئلة، يرجى التواصل معنا.
          </p>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            تاج أزال - نظام إدارة العيادات
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset confirmation email sent to ${email}`);
    } catch (error) {
      console.error(`❌ Failed to send password reset confirmation email to ${email}:`, error);
      // Don't throw error for confirmation emails as they are not critical
    }
  }
}
