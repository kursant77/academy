# Send Telegram Edge Function

Bu Supabase Edge Function Telegram bot'ga xabar yuborish uchun.

## ⚠️ TypeScript Xatoliklari Haqida

Bu faylda `Deno is not defined` xatoliklari ko'rinishi mumkin. Bu **normal** va **muammo emas**!

### Nima uchun?

- Bu fayl **Supabase Edge Function** uchun yozilgan
- Edge Function **Deno** runtime'da ishlaydi
- Lokal development environment'da Deno types mavjud emas
- **Supabase Dashboard'da deploy qilinganda** to'g'ri ishlaydi

### Yechim

1. **Ehtiyotkor bo'ling:** Bu xatoliklar faqat lokal IDE'da ko'rinadi
2. **Deploy qiling:** Supabase Dashboard'da function deploy qilinganda ishlaydi
3. **Eslatma:** `@ts-ignore` qo'shildi, bu xatoliklarni yashirish uchun

## 📋 Deploy Qilish

1. Supabase Dashboard → Edge Functions
2. `send-telegram` function'ni yarating
3. Bu kodni nusxalab yopishtiring
4. Deploy qiling

## ✅ Test Qilish

Function deploy qilingandan keyin websaytda test qiling yoki Supabase Dashboard'dagi "Invoke function" bo'limida test qiling.

