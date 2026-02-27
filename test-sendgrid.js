require('dotenv').config();
const sgMail = require('@sendgrid/mail');

async function testSendGrid() {
  console.log('🔍 Testing SendGrid Configuration...\n');
  
  // Check environment variables
  console.log('API Key:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('From Email:', process.env.SENDGRID_FROM_EMAIL || '❌ Missing');
  console.log('From Name:', process.env.SENDGRID_FROM_NAME || 'Not set\n');
  
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY is not set in .env file');
    process.exit(1);
  }
  
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: process.env.SENDGRID_FROM_EMAIL,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.SENDGRID_FROM_NAME || 'Akariza System',
    },
    subject: 'SendGrid Test - Akariza System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">✅ SendGrid Test Successful!</h2>
        <p>If you're reading this, your SendGrid configuration is working correctly.</p>
        <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `,
  };
  
  try {
    console.log('\n📧 Sending test email...');
    const result = await sgMail.send(msg);
    console.log('✅ Email sent successfully!');
    console.log('Status Code:', result[0].statusCode);
    console.log('\n✨ Check your inbox:', process.env.SENDGRID_FROM_EMAIL);
  } catch (error) {
    console.error('\n❌ SendGrid Error:');
    if (error.response) {
      console.error('Status:', error.response.statusCode);
      console.error('Body:', JSON.stringify(error.response.body, null, 2));
    } else {
      console.error(error.message);
    }
    
    console.log('\n📋 Common Issues:');
    console.log('1. Sender email not verified in SendGrid');
    console.log('2. Invalid API key');
    console.log('3. SendGrid account suspended');
    console.log('\n👉 Visit: https://app.sendgrid.com/settings/sender_auth/senders');
  }
}

testSendGrid();
