/**
 * KisanGuard AI — Production Email Notification Service
 *
 * Handles transactional account emails (Welcome, Security notices).
 * Uses nodemailer with environment variables (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM).
 *
 * Rules:
 * - Pure backend service. Never exposed to browser or frontend bundles.
 * - Non-blocking: registration never fails if email provider is unconfigured or temporarily down.
 * - Safe logging: passwords and secrets are never printed to logs.
 */

import nodemailer from 'nodemailer';

/**
 * Creates nodemailer transporter if environment variables are configured.
 */
function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

/**
 * Sends a welcome email upon successful user registration.
 *
 * @param {Object} options
 * @param {string} options.to - User email address
 * @param {string} options.name - Farmer name
 * @param {string} options.language - Preferred language ('en', 'gu', 'hi')
 */
export async function sendWelcomeEmail({ to, name = 'Farmer', language = 'gu' }) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`[Email Service] SMTP not configured. Welcome email skipped for: ${to}`);
      return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
    }

    const fromAddress = process.env.EMAIL_FROM || '"KisanGuard AI" <no-reply@kisanguard.com>';

    let subject = 'Welcome to KisanGuard AI 🌱';
    let textBody = '';
    let htmlBody = '';

    if (language === 'gu') {
      subject = 'કિસાનગાર્ડ AI માં આપનું હાર્દિક સ્વાગત છે 🌱';
      textBody = `નમસ્તે ${name},

કિસાનગાર્ડ AI માં તમારું ખાતું સફળતાપૂર્વક બની ગયું છે.

હવે તમે કિસાનગાર્ડ AI નો ઉપયોગ નીચેની સુવિધાઓ માટે કરી શકો છો:
- 🌾 પાક આયોજન અને રોગ નિદાન (Crop Vision)
- 🌦️ સ્થાનિક ચોક્કસ હવામાન આગાહી
- 💰 APMC બજાર ભાવ (Mandi Rates)
- 🏛️ સરકારી સહાય અને સબસિડી યોજનાઓ
- 📖 ડિજિટલ ખેતી ખાતાવહી (Farm Book)
- 🎙️ અવાજ અને લખાણ આધારિત AI ખેતી સહાયક

કિસાનગાર્ડ AI પસંદ કરવા બદલ આભાર.
— કિસાનગાર્ડ AI ટીમ`;

      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fdfbf7; color: #1e293b;">
          <h2 style="color: #14532d; margin-top: 0;">કિસાનગાર્ડ AI માં આપનું સ્વાગત છે! 🌱</h2>
          <p>નમસ્તે <strong>${name}</strong>,</p>
          <p>તમારું એકાઉન્ટ સફળતાપૂર્વક બની ગયું છે. હવે તમે આધુનિક ખેતી સહાયકનો ઉપયોગ કરી શકો છો:</p>
          <ul style="line-height: 1.8;">
            <li><strong>🌾 પાક રોગ નિદાન:</strong> કેમેરાથી પાંદડાનો ફોટો પાડી રોગ ઓળખો.</li>
            <li><strong>🌦️ હવામાન:</strong> વરસાદ અને તાપમાનની ચોક્કસ આગાહી.</li>
            <li><strong>💰 બજાર ભાવ:</strong> નજીકની APMC મંડીના લાઇવ ભાવ.</li>
            <li><strong>🏛️ સરકારી યોજનાઓ:</strong> સબસિડી અને પોર્ટલ સહાય.</li>
            <li><strong>📖 ફાર્મ બુક:</strong> આવક-ખર્ચનો સરળ હિસાબ.</li>
            <li><strong>🎙️ અવાજ સહાયક:</strong> ગુજરાતીમાં બોલીને પ્રશ્નો પૂછો.</li>
          </ul>
          <p style="margin-top: 24px; color: #475569; font-size: 13px;">કિસાનગાર્ડ AI ટીમ</p>
        </div>
      `;
    } else if (language === 'hi') {
      subject = 'किसानगार्ड AI में आपका स्वागत है 🌱';
      textBody = `नमस्ते ${name},

किसानगार्ड AI में आपका खाता सफलतापूर्वक बना दिया गया है।

अब आप किसानगार्ड AI का उपयोग इन सुविधाओं के लिए कर सकते हैं:
- 🌾 फसल योजना एवं रोग निदान
- 🌦️ सटीक स्थानीय मौसम पूर्वानुमान
- 💰 APMC मंडी भाव
- 🏛️ सरकारी योजनाएं एवं सब्सिडी
- 📖 डिजिटल फार्म बहीखाता (Farm Book)
- 🎙️ आवाज एवं पाठ आधारित AI कृषि सहायक

किसानगार्ड AI चुनने के लिए धन्यवाद।
— किसानगार्ड AI टीम`;

      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fdfbf7; color: #1e293b;">
          <h2 style="color: #14532d; margin-top: 0;">किसानगार्ड AI में आपका स्वागत है! 🌱</h2>
          <p>नमस्ते <strong>${name}</strong>,</p>
          <p>आपका खाता सफलतापूर्वक बना दिया गया है। आप इन सुविधाओं का उपयोग कर सकते हैं:</p>
          <ul style="line-height: 1.8;">
            <li><strong>🌾 फसल रोग निदान:</strong> पत्ती की फोटो से रोग पहचान।</li>
            <li><strong>🌦️ मौसम:</strong> सटीक वर्षा और तापमान पूर्वानुमान।</li>
            <li><strong>💰 मंडी भाव:</strong> लाइव APMC दरें।</li>
            <li><strong>🏛️ सरकारी योजनाएं:</strong> सब्सिडी और पात्रता जानकारी।</li>
            <li><strong>📖 फार्म बुक:</strong> आय और व्यय का हिसाब।</li>
            <li><strong>🎙️ आवाज सहायक:</strong> बोलकर प्रश्न पूछें।</li>
          </ul>
          <p style="margin-top: 24px; color: #475569; font-size: 13px;">किसानगार्ड AI टीम</p>
        </div>
      `;
    } else {
      subject = 'Welcome to KisanGuard AI 🌱';
      textBody = `Welcome ${name},

Your KisanGuard AI account has been created successfully.

You can now use KisanGuard AI for:
- 🌾 Crop Information & AI Leaf Diagnostics
- 🌦️ Hyperlocal Weather Forecasts
- 💰 APMC Mandi Market Prices
- 🏛️ Government Schemes & Subsidies
- 📖 Digital Farm Ledger (Farm Book)
- 🎙️ Voice & Text Agricultural Assistant

Thank you for choosing KisanGuard AI.
— The KisanGuard AI Team`;

      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fdfbf7; color: #1e293b;">
          <h2 style="color: #14532d; margin-top: 0;">Welcome to KisanGuard AI! 🌱</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account has been created successfully. You now have access to:</p>
          <ul style="line-height: 1.8;">
            <li><strong>🌾 Crop Diagnostics:</strong> AI photo analysis for pest and disease management.</li>
            <li><strong>🌦️ Weather Advisory:</strong> Live temperature, rain forecasts, and irrigation guidance.</li>
            <li><strong>💰 Mandi Prices:</strong> Verified APMC rates.</li>
            <li><strong>🏛️ Government Schemes:</strong> Subsidy databases and official portals.</li>
            <li><strong>📖 Farm Book:</strong> Simplified ledger for farm income, expenses, and profit.</li>
            <li><strong>🎙️ Voice Assistant:</strong> Multilingual conversational guidance.</li>
          </ul>
          <p style="margin-top: 24px; color: #475569; font-size: 13px;">The KisanGuard AI Team</p>
        </div>
      `;
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: textBody,
      html: htmlBody
    });

    console.log(`[Email Service] Welcome email sent successfully to ${to} (MessageId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    // Log safe error without exposing credentials
    console.warn(`[Email Service] Failed to send welcome email to ${to}: ${error.message}`);
    return { sent: false, error: error.message };
  }
}
