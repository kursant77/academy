# Telegram Bot CORS Muammosini To'liq Hal Qilish

## ❌ Muammo

```
Access to fetch at '...supabase.co/functions/v1/send-telegram' from origin 'http://localhost:5173' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check
```

## ✅ Yechim - 3 Bosqich

### BOSQICH 1: Supabase Dashboard'da Edge Function Yaratish

1. **Supabase Dashboard ga kiring:**
   - https://supabase.com/dashboard
   - Project'ingizni tanlang

2. **Edge Functions bo'limiga o'ting:**
   - Chap menuda **"Edge Functions"** ni toping va bosing
   - **"Create a new function"** tugmasini bosing

3. **Function yarating:**
   - Function nomi: `send-telegram` (aniq shu nom!)
   - **"Create function"** ni bosing

### BOSQICH 2: Function Kodini Qo'shish

Function editor'ga quyidagi **to'liq kodni** nusxalab yopishtiring:

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

### BOSQICH 3: Deploy Qilish

1. **"Deploy"** tugmasini bosing (o'ng yoki tepada)
2. 10-15 soniya kuting
3. ✅ **"Deployed"** ko'rinishini kuting
4. Function status **"Active"** bo'lishi kerak

## 🧪 Test Qilish

### 1. Browser Console'da Test

1. Browser Console'ni oching (F12)
2. Quyidagi kodni yozing:

```javascript
fetch('https://YOUR_PROJECT.supabase.co/functions/v1/send-telegram', {
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

Agar `{ success: true }` ko'rsatilsa, function to'g'ri ishlayapti!

### 2. Websaytda Test

1. Websaytga o'ting: `http://localhost:5173`
2. `/register` yoki `/contact` sahifasiga o'ting
3. Formani to'ldiring va yuboring
4. Console'da xatolik bo'lmasligi kerak
5. Telegram bot'ga xabar kelganini tekshiring!

## 🔍 Muammo Bo'lsa

### Function topilmayapti

1. **Function nomini tekshiring:** `send-telegram` (aniq shu nom!)
2. **Edge Functions → Functions** bo'limida function ko'rinayotganini tekshiring
3. **Function status:** "Active" bo'lishi kerak
4. **Function URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/send-telegram`

### Hali ham CORS xatolik

1. **Edge Functions → Functions → send-telegram → Logs** ni oching
2. Xatoliklarni ko'ring
3. Function'ni **qayta deploy** qiling
4. Browser cache'ni tozalang (`Ctrl + Shift + Delete`)

### Xabar kelmayapti

1. **Browser Console → Network** tab'ini oching
2. `send-telegram` so'roviga o'ting
3. **Request Headers** va **Response** ni ko'ring
4. **Edge Functions → Logs** da xatoliklarni tekshiring

### OPTIONS request ishlamayapti

Agar hali ham muammo bo'lsa, function kodida quyidagini tekshiring:

```typescript
// OPTIONS request'ga javob
if (req.method === 'OPTIONS') {
  return new Response(null, { 
    status: 200,  // 200 status code muhim!
    headers: CORS_HEADERS 
  });
}
```

## ✅ Tekshirish Ro'yxati

- [ ] Edge Function yaratildi (`send-telegram`)
- [ ] Function kodini to'liq yopishtirildi
- [ ] Function deploy qilindi
- [ ] Function status "Active"
- [ ] Browser Console'da test qilindi
- [ ] Websaytda formani to'ldirib test qilindi
- [ ] Telegram bot'ga xabar keldi

## 🎯 Muhim Eslatmalar

1. **Function nomi:** `send-telegram` (katta-kichik harf muhim!)
2. **CORS headers:** Barcha response'larda bo'lishi kerak
3. **OPTIONS request:** 200 status code qaytarilishi kerak
4. **Deploy:** Function deploy qilingan bo'lishi kerak

## 📝 Qo'shimcha Yordam

Agar hali ham muammo bo'lsa:

1. **Supabase Dashboard → Edge Functions → Logs** da xatoliklarni ko'ring
2. **Browser Console → Network** tab'ida so'rovlarni tekshiring
3. **Function URL** to'g'ri ekanligini tekshiring
4. **Environment variables** (.env) to'g'ri ekanligini tekshiring

---

**Iltimos, yuqoridagi qadamlarni bajarib, natijani xabar qiling!** 🚀
