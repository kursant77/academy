# CORS Xatolikni Hal Qilish - Telegram Bot

## ❌ Muammo

```
Access to fetch at 'https://...supabase.co/functions/v1/send-telegram'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

## ✅ Yechim

Bu xatolik **Edge Function** yaratilmagan yoki **deploy qilinmagan** bo'lishidan kelib chiqadi.

## 📋 3 Bosqichli Yechim

### 1️⃣ Supabase Dashboard'da Edge Function Yaratish

1. **Supabase Dashboard** ga kiring: https://supabase.com/dashboard
2. Project'ingizni tanlang
3. Chap menuda **"Edge Functions"** ni toping va bosing
4. **"Create a new function"** tugmasini bosing
5. Function nomi: `send-telegram` (aniq shu nom!)
6. **"Create function"** ni bosing

### 2️⃣ Function Kodini Qo'shish va Deploy Qilish

Function editor'ga quyidagi **to'liq kodni** yopishtiring:

```typescript
const TELEGRAM_BOT_TOKEN = "8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls";
const TELEGRAM_CHAT_ID = "5865994146";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // CORS preflight request'ni handle qilish
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      });
    }

    // Telegram Bot API ga so'rov yuborish
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.text();
      console.error("Telegram API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to send message", details: errorData }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        }
      );
    }

    const result = await telegramResponse.json();

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    });
  }
});
```

### 3️⃣ Deploy Qilish

1. **"Deploy"** tugmasini bosing (o'ng yoki tepada)
2. 10-15 soniya kuting
3. ✅ **"Deployed"** ko'rinishini kuting

## 🧪 Test Qilish

1. Browser Console'ni oching (F12)
2. Websaytga o'ting: `http://localhost:5173`
3. `/register` yoki `/contact` formasini to'ldiring
4. Yuboring
5. Console'da xatolik bo'lmasligi kerak

## 🔍 Muammo Bo'lsa

### Function topilmayapti

1. Function nomi aniq `send-telegram` ekanligini tekshiring
2. Edge Functions → Functions bo'limida function ko'rinayotganini tekshiring
3. Function **Deployed** holatda ekanligini tekshiring

### Hali ham CORS xatolik

1. Edge Functions → Functions → `send-telegram` → **Logs** ni oching
2. Xatoliklarni ko'ring
3. Function'ni **qayta deploy** qiling

### Xabar kelmayapti

1. Browser Console → Network tab'ini oching
2. `send-telegram` so'roviga o'ting
3. Response'ni ko'ring
4. Edge Functions → Logs'da xatoliklarni tekshiring

## ✅ Muhim Eslatmalar

- ✅ Function nomi: **`send-telegram`** (aniq shu nom!)
- ✅ CORS headers barcha response'larda bo'lishi kerak
- ✅ OPTIONS request'ga **200 status** qaytarilishi kerak
- ✅ Function deploy qilingan bo'lishi kerak

## 🎯 Tezkor Test

Function deploy qilingandan keyin, browser console'da test qiling:

```javascript
fetch("https://YOUR_PROJECT.supabase.co/functions/v1/send-telegram", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_ANON_KEY",
  },
  body: JSON.stringify({ message: "Test xabar" }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

Bu test muvaffaqiyatli bo'lsa, function to'g'ri ishlayapti!

---

**Iltimos, yuqoridagi qadamlarni bajarib, natijani xabar qiling!**
