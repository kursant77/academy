# Telegram Bot Sozlamalari

Loyihada Telegram bot orqali xabarlarni qabul qilish uchun quyidagi qadamlarni bajaring.

## 1. Bot Yaratish (BotFather)

1. Telegramda [@BotFather](https://t.me/BotFather) ni toping.
2. `/newbot` buyrug'ini yuboring.
3. Botga nom bering (masalan: `My Academy Bot`).
4. Botga username bering (oxiri `bot` bilan tugashi kerak, masalan: `my_academy_test_bot`).
5. BotFather sizga **TOKEN** beradi. Bu tokenni nusxalab oling.

## 2. Chat ID Olish

1. Yaratgan botingizga kiring va `Start` tugmasini bosing.
2. [@userinfobot](https://t.me/userinfobot) ga kiring va `Start` bosing.
3. U sizga **Id** raqamini beradi (masalan: `123456789`). Bu sizning Chat ID'ingiz.

## 3. Lokal Muhitda Sozlash (.env)

Loyiha ildizida `.env` faylini oching (yoki yarating) va quyidagilarni yozing:

```
VITE_TELEGRAM_BOT_TOKEN=Sizning_Bot_Tokeningiz
VITE_TELEGRAM_CHAT_ID=Sizning_Chat_ID_Raqamingiz
```

**Misol:**
```
VITE_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
VITE_TELEGRAM_CHAT_ID=987654321
```

## 4. Deploy Qilish (Vercel) - MUHIM!

⚠️ **`.env` fayli git'ga yuklanmaydi (xavfsizlik uchun). Shuning uchun saytni internetga joylaganingizda (Deploy), bu kodlar ishlamay qoladi.**

Sayt ishlashi uchun Vercel (yoki boshqa hosting) sozlamalariga bu o'zgaruvchilarni qo'shishingiz kerak:

1. **Vercel Dashboard** ga kiring.
2. Loyihangizni tanlang (**Settings** -> **Environment Variables**).
3. Quyidagi o'zgaruvchilarni qo'shing:
   - **Key:** `VITE_TELEGRAM_BOT_TOKEN`  
     **Value:** (BotFather bergan token)
   - **Key:** `VITE_TELEGRAM_CHAT_ID`  
     **Value:** (Sizning ID raqamingiz)
4. O'zgaruvchilarni saqlagandan so'ng, saytni **qayta deploy (Redeploy)** qiling.

Shu qadamlarni bajarganingizdan so'ng, Telegram xabarlari ham lokalda, ham internetdagi saytda ishlaydi.
