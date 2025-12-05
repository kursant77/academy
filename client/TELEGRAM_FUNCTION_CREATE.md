# Telegram Bot Function Yaratish - Aniq Ko'rsatmalar

Sizning screenshot'da `clever-api` function ko'rinayapti. Endi `send-telegram` nomli yangi function yaratishingiz kerak.

## 📋 Qadamlar

### 1. Yangi Function Yaratish

1. Supabase Dashboard → **Edge Functions** bo'limida
2. **"Create a new function"** yoki **"New function"** tugmasini bosing
3. Function nomini kiriting: `send-telegram`
4. **"Create function"** yoki **"Create"** tugmasini bosing

### 2. Function Kodini Qo'shish

Function yaratilgandan keyin, quyidagi kodni **to'liq** nusxalab function editor'ga yopishtiring:

```typescript
const TELEGRAM_BOT_TOKEN = '8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls';
const TELEGRAM_CHAT_ID = '5865994146';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  // CORS preflight request'ni handle qilish
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: CORS_HEADERS 
    });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          } 
        }
      );
    }

    // Telegram Bot API ga so'rov yuborish
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.text();
      console.error('Telegram API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to send message to Telegram', details: errorData }),
        { 
          status: telegramResponse.status, 
          headers: { 
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          } 
        }
      );
    }

    const result = await telegramResponse.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        } 
      }
    );
  }
});
```

### 3. Deploy Qilish

1. Kodni yopishtirgandan keyin, **"Deploy"** yoki **"Save"** tugmasini bosing
2. 10-15 soniya kuting
3. ✅ Function **"Deployed"** yoki **"Active"** ko'rinishi kerak

### 4. Function URL'ni Olish

Function yaratilgandan keyin, **Details** bo'limida **Endpoint URL** ko'rinadi:

```
https://qxuoryymkwzdtnxkqygn.supabase.co/functions/v1/send-telegram
```

Bu URL frontend kodida ishlatiladi (allaqachon sozlangan).

## 🧪 Test Qilish

### Variant 1: Supabase Dashboard'da Test

**"Invoke function"** bo'limida JavaScript kodini quyidagicha o'zgartiring:

```javascript
const { data, error } = await supabase.functions.invoke('send-telegram', {
  body: { message: 'Test xabar' },
})
```

Va **"Run"** tugmasini bosing.

### Variant 2: Browser Console'da Test

1. Browser Console'ni oching (F12)
2. Quyidagi kodni yozing:

```javascript
fetch('https://qxuoryymkwzdtnxkqygn.supabase.co/functions/v1/send-telegram', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({ message: 'Test xabar' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Variant 3: Websaytda Test

1. Websaytga o'ting: `http://localhost:5173`
2. `/register` formasini to'ldiring
3. Yuboring
4. Telegram bot'ga xabar kelganini tekshiring!

## ✅ Tekshirish

- [ ] Function yaratildi: `send-telegram`
- [ ] Function kodini qo'shildi
- [ ] Function deploy qilindi
- [ ] Function status "Active"
- [ ] Endpoint URL to'g'ri: `/functions/v1/send-telegram`
- [ ] Test muvaffaqiyatli

## 🔍 Muammo Bo'lsa

### Function topilmayapti
- Function nomini tekshiring: `send-telegram` (aniq shu nom!)
- Functions ro'yxatida `send-telegram` ko'rinayotganini tekshiring

### CORS xatolik
- Function kodida CORS headers borligini tekshiring
- Function'ni qayta deploy qiling
- Browser cache'ni tozalang

### Xabar kelmayapti
- Edge Functions → Logs'da xatoliklarni ko'ring
- Browser Console → Network tab'ida so'rovlarni tekshiring

---

**Function yaratilgandan keyin, websaytda test qiling!** 🚀

