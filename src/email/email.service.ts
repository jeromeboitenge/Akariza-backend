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
      const result = await sgMail.send(msg);
      console.log('✅ Email sent successfully to:', to);
      console.log('SendGrid Response:', result[0].statusCode);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('❌ SendGrid Error Details:');
      console.error('To:', to);
      console.error('From:', process.env.SENDGRID_FROM_EMAIL);
      console.error('Error:', error.response?.body || error.message);
      
      // Don't throw error - return failure but allow login to continue
      return { success: false, message: error.response?.body?.errors?.[0]?.message || 'Failed to send email' };
    }
  }

  async sendWelcomeEmail(to: string, fullName: string, role: string, tempPassword: string) {
    const subject = 'Welcome to Akariza - Your Account is Ready! 🎉';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .credentials { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .credentials p { margin: 10px 0; font-size: 15px; }
          .credentials strong { color: #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Akariza!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>Your account has been successfully created! We're excited to have you on board.</p>
            
            <div class="credentials">
              <h3 style="margin-top: 0; color: #667eea;">📋 Your Login Credentials</h3>
              <p><strong>Email:</strong> ${to}</p>
              <p><strong>Role:</strong> ${role}</p>
              <p><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${tempPassword}</code></p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong>
              <p style="margin: 5px 0 0 0;">Please change your password immediately after your first login for security purposes.</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Visit the Akariza login page</li>
              <li>Enter your email and temporary password</li>
              <li>Verify the OTP sent to your email</li>
              <li>Change your password in settings</li>
            </ol>
            
            <p>If you have any questions or need assistance, please contact your system administrator.</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>Akariza Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message from Akariza Stock Management System</p>
            <p style="color: #999; font-size: 12px;">© 2026 Akariza. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, fullName: string, resetToken: string) {
    const subject = '🔑 Password Reset Request - Akariza';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .token-box { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; text-align: center; }
          .token { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px; font-family: 'Courier New', monospace; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .info { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>We received a request to reset your Akariza account password. Use the reset token below:</p>
            
            <div class="token-box">
              <div style="color: #666; font-size: 14px; margin-bottom: 10px;">Your Reset Token</div>
              <div class="token">${resetToken}</div>
            </div>
            
            <div class="warning">
              <strong>⏱️ Time Sensitive:</strong>
              <p style="margin: 5px 0 0 0;">This token will expire in <strong>1 hour</strong></p>
            </div>
            
            <div class="info">
              <strong>🛡️ Security Notice:</strong>
              <p style="margin: 5px 0 0 0;">If you didn't request this password reset, please ignore this email and contact support immediately.</p>
            </div>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>Akariza Security Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated security message from Akariza</p>
            <p style="color: #999; font-size: 12px;">© 2026 Akariza. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendOtpEmail(to: string, fullName: string, otpCode: string) {
    const subject = '🔐 Your Akariza Login Code';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .otp-code { font-size: 48px; font-weight: bold; color: white; letter-spacing: 12px; margin: 0; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
          .otp-label { color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .info { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .timer { color: #dc2626; font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Login Verification</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>You requested to login to your Akariza account. Use the verification code below to complete your login:</p>
            
            <div class="otp-box">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otpCode}</div>
            </div>
            
            <div class="warning">
              <strong>⏱️ Time Sensitive:</strong>
              <p style="margin: 5px 0 0 0;" class="timer">This code will expire in 5 minutes</p>
            </div>
            
            <div class="info">
              <strong>🛡️ Security Tips:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>Akariza staff will never ask for your OTP</li>
                <li>If you didn't request this, please contact support immediately</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>Akariza Security Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated security message from Akariza</p>
            <p style="color: #999; font-size: 12px;">© 2026 Akariza. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendLowStockAlert(to: string, productName: string, currentStock: number, minStock: number) {
    const subject = `⚠️ Low Stock Alert: ${productName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .alert-box { background: #fef2f2; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .stock-info { display: flex; justify-content: space-around; margin: 20px 0; }
          .stock-item { text-align: center; padding: 15px; }
          .stock-number { font-size: 36px; font-weight: bold; margin: 10px 0; }
          .current { color: #dc2626; }
          .minimum { color: #f59e0b; }
          .action { background: #dc2626; color: white; padding: 15px 30px; text-align: center; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <h3 style="margin-top: 0; color: #dc2626;">Urgent: Stock Running Low!</h3>
              <p style="font-size: 18px; margin: 0;"><strong>${productName}</strong></p>
            </div>
            
            <div class="stock-info">
              <div class="stock-item">
                <div style="color: #666; font-size: 14px;">Current Stock</div>
                <div class="stock-number current">${currentStock}</div>
                <div style="color: #666; font-size: 12px;">units</div>
              </div>
              <div class="stock-item">
                <div style="color: #666; font-size: 14px;">Minimum Required</div>
                <div class="stock-number minimum">${minStock}</div>
                <div style="color: #666; font-size: 12px;">units</div>
              </div>
            </div>
            
            <div class="action">
              <strong>⚡ Action Required:</strong> Please reorder this product immediately to avoid stockouts
            </div>
            
            <p><strong>Recommended Actions:</strong></p>
            <ul>
              <li>Contact your supplier</li>
              <li>Create a purchase order</li>
              <li>Update stock forecasts</li>
              <li>Notify relevant team members</li>
            </ul>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>Akariza Inventory System</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated alert from Akariza Stock Management</p>
            <p style="color: #999; font-size: 12px;">© 2026 Akariza. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendSalesSummary(to: string, date: string, totalSales: number, totalRevenue: number) {
    const subject = `📊 Daily Sales Summary - ${date}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
          .summary-box { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 10px; margin: 20px 0; }
          .metric { text-align: center; margin: 20px 0; }
          .metric-value { font-size: 42px; font-weight: bold; color: #059669; margin: 10px 0; }
          .metric-label { color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
          .divider { border-top: 2px solid #d1fae5; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Daily Sales Summary</h1>
          </div>
          <div class="content">
            <p style="text-align: center; font-size: 18px; color: #666;"><strong>${date}</strong></p>
            
            <div class="summary-box">
              <div class="metric">
                <div class="metric-label">Total Sales</div>
                <div class="metric-value">${totalSales}</div>
                <div style="color: #666; font-size: 14px;">transactions</div>
              </div>
              
              <div class="divider"></div>
              
              <div class="metric">
                <div class="metric-label">Total Revenue</div>
                <div class="metric-value">${totalRevenue.toLocaleString()}</div>
                <div style="color: #666; font-size: 14px;">RWF</div>
              </div>
            </div>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #1e40af; font-size: 16px;">
                <strong>🎉 Great work today!</strong><br>
                <span style="font-size: 14px;">Keep up the excellent performance</span>
              </p>
            </div>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>Akariza Analytics Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated daily report from Akariza</p>
            <p style="color: #999; font-size: 12px;">© 2026 Akariza. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
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
