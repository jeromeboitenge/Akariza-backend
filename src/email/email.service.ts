import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(to: string, subject: string, html: string) {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Akariza System',
      },
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('SendGrid Error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(to: string, fullName: string, role: string, tempPassword: string) {
    const subject = 'Welcome to Akariza System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Akariza System!</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Your account has been created with the role: <strong>${role}</strong></p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        
        <p style="color: #dc2626;"><strong>Important:</strong> Please change your password after your first login.</p>
        
        <p>If you have any questions, please contact your administrator.</p>
        
        <p>Best regards,<br>Akariza Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, fullName: string, resetToken: string) {
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>We received a request to reset your password.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Reset Token:</h3>
          <p style="font-size: 24px; font-weight: bold; color: #2563eb;">${resetToken}</p>
        </div>
        
        <p>This token will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        
        <p>Best regards,<br>Akariza Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendOtpEmail(to: string, fullName: string, otpCode: string) {
    const subject = 'Your Login OTP Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🔐 Login Verification</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Your OTP code for login verification:</p>
        
        <div style="background-color: #eff6ff; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; margin: 0;">${otpCode}</p>
        </div>
        
        <p style="color: #dc2626;"><strong>This code will expire in 5 minutes.</strong></p>
        <p>If you didn't attempt to login, please contact your administrator immediately.</p>
        
        <p>Best regards,<br>Akariza Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendLowStockAlert(to: string, productName: string, currentStock: number, minStock: number) {
    const subject = `Low Stock Alert: ${productName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Low Stock Alert</h2>
        <p>The following product is running low on stock:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">${productName}</h3>
          <p><strong>Current Stock:</strong> ${currentStock}</p>
          <p><strong>Minimum Stock Level:</strong> ${minStock}</p>
        </div>
        
        <p>Please reorder this product as soon as possible.</p>
        
        <p>Best regards,<br>Akariza System</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendSalesSummary(to: string, date: string, totalSales: number, totalRevenue: number) {
    const subject = `Daily Sales Summary - ${date}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">📊 Daily Sales Summary</h2>
        <p><strong>Date:</strong> ${date}</p>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Today's Performance:</h3>
          <p style="font-size: 18px;"><strong>Total Sales:</strong> ${totalSales}</p>
          <p style="font-size: 18px;"><strong>Total Revenue:</strong> ${totalRevenue.toLocaleString()} RWF</p>
        </div>
        
        <p>Keep up the great work!</p>
        
        <p>Best regards,<br>Akariza System</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendExpenseNotification(to: string, category: string, amount: number, description: string) {
    const subject = `New Expense Recorded: ${category}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">💰 New Expense Recorded</h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Expense Details:</h3>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Amount:</strong> ${amount.toLocaleString()} RWF</p>
          <p><strong>Description:</strong> ${description}</p>
        </div>
        
        <p>This expense has been recorded in the system.</p>
        
        <p>Best regards,<br>Akariza System</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }
}
