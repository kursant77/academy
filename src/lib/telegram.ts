/**
 * Telegram Bot API utility functions
 * Sends messages directly to Telegram bot from frontend
 */

// Telegram Bot sozlamalari - .env faylida saqlang
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = (import.meta.env.VITE_TELEGRAM_CHAT_ID || '').toString().trim().split(',')[0]; // Faqat birinchi Chat ID ni olish

/**
 * Sends a message directly to Telegram bot
 * @param text - Message text to send (HTML format supported)
 * @returns Promise<boolean> - Returns true if message was sent successfully
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram Bot Token yoki Chat ID topilmadi. .env faylini tekshiring.');
    console.warn('VITE_TELEGRAM_BOT_TOKEN va VITE_TELEGRAM_CHAT_ID kerak.');
    return false;
  }

  // Chat ID ni tozalash va tekshirish - faqat raqamlar bo'lishi kerak
  const chatIdClean = TELEGRAM_CHAT_ID.toString().trim();
  if (!/^-?\d+$/.test(chatIdClean)) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Telegram: Chat ID noto\'g\'ri format!');
      console.warn(`Chat ID: "${TELEGRAM_CHAT_ID}"`);
      console.warn('Qo\'llanma: TELEGRAM_SETUP.md faylini ko\'ring');
    }
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatIdClean,
          text: text,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Xatoliklarni faqat development mode'da ko'rsatish
      if (import.meta.env.DEV) {
        console.warn('Telegram API xatosi:', errorData);
        
        // Aniq xatolik xabarlarini ko'rsatish (faqat development mode'da)
        if (errorData.error_code === 400 && errorData.description?.includes('chat not found')) {
          console.warn('⚠️ Telegram: Chat topilmadi. Bot\'ga /start yuboring yoki Chat ID ni tekshiring');
          console.warn(`Chat ID: ${chatIdClean}`);
          console.warn('Qo\'llanma: TELEGRAM_SETUP.md faylini ko\'ring');
        } else if (errorData.error_code === 401) {
          console.warn('⚠️ Telegram: Bot token noto\'g\'ri');
        } else if (errorData.error_code === 403) {
          console.warn('⚠️ Telegram: Bot chatga xabar yuborish huquqiga ega emas');
        }
      }
      
      return false;
    }

    const result = await response.json();
    return result.ok === true;
  } catch (error) {
    // Xatoliklarni faqat development mode'da ko'rsatish
    if (import.meta.env.DEV) {
      console.warn('Telegram xabar yuborishda xatolik:', error);
    }
    return false;
  }
}

/**
 * Formats registration form data into Telegram message
 */
export function formatRegistrationMessage(data: {
  fullName: string;
  age: string;
  phone: string;
  courseName: string;
  parentPhone?: string;
}): string {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `
🎓 <b>🆕 YANGI RO'YXATDAN O'TISH</b>
━━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>Ism:</b> ${escapeHtml(data.fullName)}
📅 <b>Yosh:</b> ${escapeHtml(data.age)} yosh
📱 <b>Telefon raqami:</b> <code>${escapeHtml(data.phone)}</code>
`;

  if (data.parentPhone && data.parentPhone.trim()) {
    message += `👨‍👩‍👧 <b>Ota-ona telefon:</b> <code>${escapeHtml(data.parentPhone.trim())}</code>\n`;
  }

  message += `📚 <b>Tanlangan kurs:</b> ${escapeHtml(data.courseName)}

━━━━━━━━━━━━━━━━━━━━━━━━
⏰ <i>${formattedDate}</i>
  `;

  return message.trim();
}

/**
 * Formats contact form data into Telegram message
 */
export function formatContactMessage(data: {
  name: string;
  email: string;
  message: string;
}): string {
  return `
📧 <b>Yangi xabar (Aloqa)</b>

👤 <b>Ism:</b> ${escapeHtml(data.name)}
📮 <b>Email:</b> ${escapeHtml(data.email)}
💬 <b>Xabar:</b>

${escapeHtml(data.message)}

⏰ <i>Vaqt: ${new Date().toLocaleString('uz-UZ')}</i>
  `.trim();
}

/**
 * Escapes HTML special characters for Telegram HTML parse mode
 */
function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
