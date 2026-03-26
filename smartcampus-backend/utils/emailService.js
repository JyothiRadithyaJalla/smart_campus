const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  // Check if email is enabled
  if (process.env.EMAIL_ENABLED === "false") {
    console.log("📧 Email service disabled - running in test mode");
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    return transporter;
  } catch (error) {
    console.error("❌ Error creating email transporter:", error.message);
    return null;
  }
};

// Send booking confirmation email
const sendBookingConfirmation = async (userEmail, userName, bookingDetails) => {
  const transporter = createTransporter();

  const emailContent = {
    from: `"Campus Resource Management" <${process.env.EMAIL_USER || "noreply@campus.com"}>`,
    to: userEmail,
    subject: "✅ Booking Confirmed - Campus Resource",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your booking has been successfully confirmed. Here are the details:</p>
            
            <div class="booking-card">
              <h3>📋 Booking Details</h3>
              <div class="detail-row">
                <span class="label">Resource:</span>
                <span class="value">${bookingDetails.resourceName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Type:</span>
                <span class="value">${bookingDetails.resourceType}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${new Date(bookingDetails.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${bookingDetails.startTime} - ${bookingDetails.endTime}</span>
              </div>
              ${
                bookingDetails.purpose
                  ? `
              <div class="detail-row">
                <span class="label">Purpose:</span>
                <span class="value">${bookingDetails.purpose}</span>
              </div>
              `
                  : ""
              }
              <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span class="value">#${bookingDetails.bookingId}</span>
              </div>
            </div>

            <p><strong>⏰ Important:</strong> Please arrive on time. Late arrivals may result in reduced booking time.</p>
            
            <p>If you need to cancel or modify your booking, please log in to your account.</p>
            
            <div class="footer">
              <p>Thank you for using Campus Resource Management System</p>
              <p style="font-size: 12px; color: #9ca3af;">This is an automated email, please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hi ${userName},

Your booking has been successfully confirmed!

Booking Details:
- Resource: ${bookingDetails.resourceName}
- Type: ${bookingDetails.resourceType}
- Date: ${new Date(bookingDetails.date).toLocaleDateString()}
- Time: ${bookingDetails.startTime} - ${bookingDetails.endTime}
${bookingDetails.purpose ? `- Purpose: ${bookingDetails.purpose}` : ""}
- Booking ID: #${bookingDetails.bookingId}

Please arrive on time. If you need to cancel or modify your booking, log in to your account.

Thank you for using Campus Resource Management System
    `,
  };

  // If transporter is null (disabled or error), log to console
  if (!transporter) {
    console.log("\n📧 ====== EMAIL NOTIFICATION (Test Mode) ======");
    console.log(`To: ${emailContent.to}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Booking ID: ${bookingDetails.bookingId}`);
    console.log(`Resource: ${bookingDetails.resourceName}`);
    console.log(`Date: ${new Date(bookingDetails.date).toLocaleDateString()}`);
    console.log(
      `Time: ${bookingDetails.startTime} - ${bookingDetails.endTime}`,
    );
    console.log("============================================\n");
    return { success: true, mode: "test" };
  }

  // Send actual email
  try {
    const info = await transporter.sendMail(emailContent);
    console.log("✅ Booking confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      "❌ Error sending booking confirmation email:",
      error.message,
    );
    return { success: false, error: error.message };
  }
};

// Send booking cancellation email
const sendBookingCancellation = async (userEmail, userName, bookingDetails) => {
  const transporter = createTransporter();

  const emailContent = {
    from: `"Campus Resource Management" <${process.env.EMAIL_USER || "noreply@campus.com"}>`,
    to: userEmail,
    subject: "❌ Booking Cancelled - Campus Resource",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚫 Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your booking has been cancelled. Here are the details of the cancelled booking:</p>
            
            <div class="booking-card">
              <h3>📋 Cancelled Booking Details</h3>
              <div class="detail-row">
                <span class="label">Resource:</span>
                <span class="value">${bookingDetails.resourceName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Type:</span>
                <span class="value">${bookingDetails.resourceType}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${new Date(bookingDetails.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${bookingDetails.startTime} - ${bookingDetails.endTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span class="value">#${bookingDetails.bookingId}</span>
              </div>
            </div>

            <p>The resource is now available for other users to book.</p>
            <p>You can make a new booking anytime by logging into your account.</p>
            
            <div class="footer">
              <p>Thank you for using Campus Resource Management System</p>
              <p style="font-size: 12px; color: #9ca3af;">This is an automated email, please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hi ${userName},

Your booking has been cancelled.

Cancelled Booking Details:
- Resource: ${bookingDetails.resourceName}
- Type: ${bookingDetails.resourceType}
- Date: ${new Date(bookingDetails.date).toLocaleDateString()}
- Time: ${bookingDetails.startTime} - ${bookingDetails.endTime}
- Booking ID: #${bookingDetails.bookingId}

The resource is now available for other users to book.

Thank you for using Campus Resource Management System
    `,
  };

  // If transporter is null (disabled or error), log to console
  if (!transporter) {
    console.log("\n📧 ====== EMAIL NOTIFICATION (Test Mode) ======");
    console.log(`To: ${emailContent.to}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Booking ID: ${bookingDetails.bookingId}`);
    console.log(`Resource: ${bookingDetails.resourceName}`);
    console.log(`Status: CANCELLED`);
    console.log("============================================\n");
    return { success: true, mode: "test" };
  }

  // Send actual email
  try {
    const info = await transporter.sendMail(emailContent);
    console.log("✅ Cancellation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending cancellation email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation,
};
