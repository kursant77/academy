import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uz: {
    translation: {
      nav: {
        home: "Bosh sahifa",
        courses: "IELTS Kurslari",
        teachers: "Ekspertlar",
        about: "Biz haqimizda",
        events: "Mock Exam",
        schedule: "Dars Jadvali",
        achievements: "Natijalar",
        contact: "Aloqa",
        register: "Sinov Darsiga Yozilish"
      },
      hero: {
        title: "IELTS 8.0+ Sari Yo'l",
        subtitle: "Xorazmdagi eng kuchli IELTS ekspertlari bilan yuqori natijani qo'lga kiriting",
        registerBtn: "Sinov Darsiga Yozilish",
        viewCoursesBtn: "Kurslarni Ko'rish",
        badge: "Professional IELTS Markazi",
        live: "Speaking Club",
        certified: "8.0+ Natijalar",
        flexible: "Mock Exams"
      },
      stats: {
        students: "O'quvchilar",
        years: "Yillik Tajriba",
        courses: "Darajalar",
        graduates: "8.0+ Olganlar"
      },
      courses: {
        title: "IELTS Kurslari",
        subtitle: "Beginner darajasidan 8.0 gacha",
        filter: "Filter",
        all: "Barchasi",
        it: "Foundation",
        languages: "Pre-IELTS",
        exams: "IELTS Standard",
        duration: "Davomiyligi",
        price: "Narxi",
        level: "Daraja",
        teacher: "Instructor",
        viewDetails: "Batafsil",
        beginner: "Foundation",
        intermediate: "Pre-IELTS",
        advanced: "IELTS Rocket",
        noCourses: "Kurslar topilmadi"
      },
      common: {
        loading: "Yuklanmoqda..."
      },
      teachers: {
        title: "Bizning o'qituvchilar",
        subtitle: "Malakali va tajribali mutaxassislar",
        experience: "yil tajriba",
        viewProfile: "Ko'proq"
      },
      testimonials: {
        title: "O'quvchilar fikrlari",
        subtitle: "Bizning bitiruvchilarimiz biz haqida"
      },
      events: {
        title: "Tadbirlar va yangiliklar",
        subtitle: "O'quv markazimizdagi so'nggi yangiliklar",
        readMore: "Ko'proq o'qish"
      },
      register: {
        title: "Kurslarga yozilish",
        subtitle: "Ro'yxatdan o'ting va o'qishni boshlang",
        fullName: "To'liq ism",
        age: "Yosh",
        phone: "Telefon raqam",
        selectCourse: "Kursni tanlang",
        submit: "Yuborish",
        success: "Arizangiz yuborildi! Tez orada siz bilan bog'lanamiz.",
        error: "Xatolik",
        loading: "Yuborilmoqda..."
      },
      contact: {
        title: "Biz bilan bog'laning",
        subtitle: "Savollaringiz bormi? Biz bilan bog'laning",
        address: "Manzil",
        phone: "Telefon",
        email: "Email",
        workHours: "Ish vaqti",
        mondayFriday: "Dushanba - Juma",
        saturday: "Shanba",
        sunday: "Yakshanba: Dam olish kuni",
        name: "Ismingiz",
        message: "Xabar",
        send: "Yuborish"
      },
      about: {
        title: "Biz haqimizda",
        mission: "Missiyamiz",
        vision: "Vizionimiz",
        history: "Tarixiy",
        advantages: "Afzalliklarimiz",
        team: "Bizning jamoa"
      },
      schedule: {
        title: "Dars jadvali",
        subtitle: "Haftalik dars jadvali",
        monday: "Dushanba",
        tuesday: "Seshanba",
        wednesday: "Chorshanba",
        thursday: "Payshanba",
        friday: "Juma",
        saturday: "Shanba",
        sunday: "Yakshanba",
        online: "Online",
        offline: "Offline",
        room: "Xona"
      },
      achievements: {
        title: "Yutuqlar",
        subtitle: "Bizning o'quvchilarimizning erishgan natijalari",
      },
      footer: {
        about: "IELTS Imperia - zamonaviy o'quv markazi",
        quickLinks: "Tezkor havolalar",
        followUs: "Ijtimoiy tarmoqlar",
        rights: "Barcha huquqlar himoyalangan"
      }
    }
  },
  ru: {
    translation: {
      nav: {
        home: "Главная",
        courses: "Курсы IELTS",
        teachers: "Эксперты",
        about: "О нас",
        events: "Mock Exam",
        schedule: "Расписание",
        achievements: "Результаты",
        contact: "Контакты",
        register: "Пробный Урок"
      },
      hero: {
        title: "Путь к IELTS 8.0+",
        subtitle: "Достигните высоких результатов с лучшими экспертами Хорезма",
        registerBtn: "Записаться на Пробный",
        viewCoursesBtn: "Посмотреть Курсы",
        badge: "Профессиональный Центр IELTS",
        live: "Speaking Club",
        certified: "Результаты 8.0+",
        flexible: "Mock Exams"
      },
      stats: {
        students: "Студентов",
        years: "Лет Опыта",
        courses: "Уровни",
        graduates: "Получили 8.0+"
      },
      courses: {
        title: "Курсы IELTS",
        subtitle: "От Beginner до 8.0",
        filter: "Фильтр",
        all: "Все",
        it: "Foundation",
        languages: "Pre-IELTS",
        exams: "IELTS Standard",
        duration: "Длительность",
        price: "Цена",
        level: "Уровень",
        teacher: "Инструктор",
        viewDetails: "Подробнее",
        beginner: "Foundation",
        intermediate: "Pre-IELTS",
        advanced: "IELTS Rocket",
        noCourses: "Курсы не найдены"
      },
      common: {
        loading: "Загрузка..."
      },
      teachers: {
        title: "Наши Эксперты",
        subtitle: "Инструкторы с сертификатом 8.5+",
        experience: "лет опыта",
        viewProfile: "Подробнее"
      },
      testimonials: {
        title: "Отзывы студентов",
        subtitle: "Истории успеха 8.0+"
      },
      events: {
        title: "Mock Exams",
        subtitle: "Расписание пробных экзаменов",
        readMore: "Читать далее"
      },
      register: {
        title: "Записаться на IELTS",
        subtitle: "Начните подготовку сегодня",
        fullName: "Полное имя",
        age: "Возраст",
        phone: "Номер телефона",
        selectCourse: "Выберите курс",
        submit: "Отправить",
        success: "Ваша заявка отправлена! Мы свяжемся с вами в ближайшее время.",
        error: "Ошибка",
        loading: "Отправка..."
      },
      contact: {
        title: "Свяжитесь с нами",
        subtitle: "Есть вопросы по IELTS? Напишите нам",
        address: "Адрес",
        phone: "Телефон",
        email: "Email",
        workHours: "Рабочие часы",
        mondayFriday: "Понедельник - Пятница",
        saturday: "Суббота",
        sunday: "Воскресенье: Выходной",
        name: "Ваше имя",
        message: "Сообщение",
        send: "Отправить"
      },
      about: {
        title: "О нас",
        mission: "Наша миссия",
        vision: "Наше видение",
        history: "История",
        advantages: "Наши преимущества",
        team: "Наши Эксперты"
      },
      schedule: {
        title: "Расписание занятий",
        subtitle: "Расписание групп IELTS",
        monday: "Понедельник",
        tuesday: "Вторник",
        wednesday: "Среда",
        thursday: "Четверг",
        friday: "Пятница",
        saturday: "Суббота",
        sunday: "Воскресенье",
        online: "Онлайн",
        offline: "Оффлайн",
        room: "Комната"
      },
      achievements: {
        title: "Наши Результаты",
        subtitle: "Сертификаты наших студентов",
      },
      footer: {
        about: "IELTS Imperia - центр подготовки к IELTS",
        quickLinks: "Быстрые ссылки",
        followUs: "Социальные сети",
        rights: "Все права защищены"
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        courses: "IELTS Courses",
        teachers: "Experts",
        about: "About",
        events: "Mock Exam",
        schedule: "Schedule",
        achievements: "Results",
        contact: "Contact",
        register: "Trial Lesson"
      },
      hero: {
        title: "Path to IELTS 8.0+",
        subtitle: "Achieve high scores with the best experts in Khorezm",
        registerBtn: "Trial Lesson",
        viewCoursesBtn: "View Courses",
        badge: "Professional IELTS Center",
        live: "Speaking Club",
        certified: "8.0+ Results",
        flexible: "Mock Exams"
      },
      stats: {
        students: "Students",
        years: "Years Experience",
        courses: "Levels",
        graduates: "Scored 8.0+"
      },
      courses: {
        title: "IELTS Courses",
        subtitle: "From Beginner to 8.0",
        filter: "Filter",
        all: "All",
        it: "Foundation",
        languages: "Pre-IELTS",
        exams: "IELTS Standard",
        duration: "Duration",
        price: "Price",
        level: "Level",
        teacher: "Instructor",
        viewDetails: "View Details",
        beginner: "Foundation",
        intermediate: "Pre-IELTS",
        advanced: "IELTS Rocket",
        noCourses: "No courses found"
      },
      common: {
        loading: "Loading..."
      },
      teachers: {
        title: "Our Experts",
        subtitle: "Instructors with 8.5+ Band Score",
        experience: "years experience",
        viewProfile: "View Profile"
      },
      testimonials: {
        title: "Student Reviews",
        subtitle: "Success stories of 8.0+ scorers"
      },
      events: {
        title: "Mock Exams",
        subtitle: "Schedule of upcoming mock exams",
        readMore: "Read More"
      },
      register: {
        title: "Book IELTS Course",
        subtitle: "Start your preparation today",
        fullName: "Full Name",
        age: "Age",
        phone: "Phone Number",
        selectCourse: "Select Level",
        submit: "Submit",
        success: "Your application has been submitted! We will contact you soon.",
        error: "Error",
        loading: "Submitting..."
      },
      contact: {
        title: "Contact Us",
        subtitle: "Questions about IELTS? Get in touch",
        address: "Address",
        phone: "Phone",
        email: "Email",
        workHours: "Working Hours",
        mondayFriday: "Monday - Friday",
        saturday: "Saturday",
        sunday: "Sunday: Closed",
        name: "Your Name",
        message: "Message",
        send: "Send"
      },
      about: {
        title: "About Us",
        mission: "Our Mission",
        vision: "Our Vision",
        history: "History",
        advantages: "Why Choose Us",
        team: "Our Experts"
      },
      schedule: {
        title: "Class Schedule",
        subtitle: "IELTS group schedule",
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday",
        online: "Online",
        offline: "Offline",
        room: "Room"
      },
      achievements: {
        title: "Results",
        subtitle: "Our students' band scores",
      },
      footer: {
        about: "IELTS Imperia - Professional IELTS Center",
        quickLinks: "Quick Links",
        followUs: "Follow Us",
        rights: "All rights reserved"
      }
    }
  }
};

// Get initial language from localStorage or default to 'uz'
const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('language');
    if (savedLang && ['uz', 'ru', 'en'].includes(savedLang)) {
      return savedLang;
    }
  }
  return 'uz';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'uz',
    supportedLngs: ['uz', 'ru', 'en'],
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Listen for storage changes to sync language across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'language' && e.newValue && ['uz', 'ru', 'en'].includes(e.newValue)) {
      i18n.changeLanguage(e.newValue).catch(console.error);
    }
  });

  // Listen for custom languagechange event
  window.addEventListener('languagechange', () => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && savedLang !== i18n.language && ['uz', 'ru', 'en'].includes(savedLang)) {
      i18n.changeLanguage(savedLang).catch(console.error);
    }
  });
}

export default i18n;
