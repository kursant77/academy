# Environment Variables for Deployment

## Vercel Deployment

Vercel'da quyidagi environment variables'ni sozlash kerak:

### Settings > Environment Variables

1. **VITE_SUPABASE_URL**
   - Value: `https://your-project.supabase.co`
   - Environment: Production, Preview, Development

2. **VITE_SUPABASE_ANON_KEY**
   - Value: `eyJhbGci...` (Supabase dashboard'dan oling)
   - Environment: Production, Preview, Development

### Qanday sozlash:

1. Vercel dashboard'ga kiring
2. Project Settings > Environment Variables
3. Har bir variable uchun:
   - Key: `VITE_SUPABASE_URL` yoki `VITE_SUPABASE_ANON_KEY`
   - Value: Supabase'dan olingan qiymat
   - Environment: Barcha (Production, Preview, Development) ni tanlang
4. Save qiling
5. Project'ni qayta deploy qiling

### Supabase credentials qayerdan olinadi:

1. Supabase dashboard'ga kiring: https://app.supabase.com
2. Project'ni tanlang
3. Settings > API
4. `Project URL` - bu `VITE_SUPABASE_URL`
5. `anon public` key - bu `VITE_SUPABASE_ANON_KEY`

### Tekshirish:

Deploy qilgandan keyin browser console'da xatolik bo'lmasligi kerak.

