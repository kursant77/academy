import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uz: {
    translation: {
      nav: {
        home: "Bosh sahifa",
        courses: "Kurslar",
        teachers: "O'qituvchilar",
        about: "Biz haqimizda",
        events: "Tadbirlar",
        schedule: "Jadval",
        achievements: "Yutuqlar",
        contact: "Aloqa",
        register: "Kursga yozilish"
      },
      hero: {
        title: "Kelajagingiz uchun bilim",
        subtitle: "Professional o'qituvchilar, zamonaviy dastur va kafolatlangan natija",
        registerBtn: "Kurslarga yozilish",
        viewCoursesBtn: "Kurslarni ko'rish",
        badge: "Professional ta'lim",
        live: "Jonli darslar",
        certified: "Muvaffaqiyatli O'quvchilar",
        flexible: "Moslashuvchan jadval"
      },
      stats: {
        students: "O'quvchilar",
        years: "Yillik tajriba",
        courses: "Kurslar",
        graduates: "Bitiruvchilar"
      },
      courses: {
        title: "Bizning kurslar",
        subtitle: "Turli yo'nalishlar bo'yicha professional ta'lim",
        filter: "Filter",
        all: "Barchasi",
        it: "IT kurslari",
        languages: "Tillar",
        exams: "Abituriyentlar uchun",
        duration: "Davomiyligi",
        price: "Narxi",
        level: "Daraja",
        teacher: "O'qituvchi",
        viewDetails: "Batafsil",
        beginner: "Boshlang'ich",
        intermediate: "O'rta",
        advanced: "Yuqori",
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
        about: "A+ Academy - zamonaviy o'quv markazi",
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
        courses: "Курсы",
        teachers: "Преподаватели",
        about: "О нас",
        events: "События",
        schedule: "Расписание",
        achievements: "Достижения",
        contact: "Контакты",
        register: "Записаться на курс"
      },
      hero: {
        title: "Знания для вашего будущего",
        subtitle: "Профессиональные преподаватели, современная программа и гарантированный результат",
        registerBtn: "Записаться на курсы",
        viewCoursesBtn: "Посмотреть курсы",
        badge: "Профессиональное образование",
        live: "Живые занятия",
        certified: "Успешные студенты",
        flexible: "Гибкий график"
      },
      stats: {
        students: "Студентов",
        years: "Лет опыта",
        courses: "Курсов",
        graduates: "Выпускников"
      },
      courses: {
        title: "Наши курсы",
        subtitle: "Профессиональное обучение по различным направлениям",
        filter: "Фильтр",
        all: "Все",
        it: "IT курсы",
        languages: "Языки",
        exams: "Для абитуриентов",
        duration: "Длительность",
        price: "Цена",
        level: "Уровень",
        teacher: "Преподаватель",
        viewDetails: "Подробнее",
        beginner: "Начальный",
        intermediate: "Средний",
        advanced: "Продвинутый",
        noCourses: "Курсы не найдены"
      },
      common: {
        loading: "Загрузка..."
      },
      teachers: {
        title: "Наши преподаватели",
        subtitle: "Квалифицированные и опытные специалисты",
        experience: "лет опыта",
        viewProfile: "Подробнее"
      },
      testimonials: {
        title: "Отзывы студентов",
        subtitle: "Что говорят наши выпускники"
      },
      events: {
        title: "События и новости",
        subtitle: "Последние новости нашего учебного центра",
        readMore: "Читать далее"
      },
      register: {
        title: "Записаться на курсы",
        subtitle: "Зарегистрируйтесь и начните обучение",
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
        subtitle: "Есть вопросы? Свяжитесь с нами",
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
        team: "Наша команда"
      },
      schedule: {
        title: "Расписание занятий",
        subtitle: "Недельное расписание",
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
        title: "Достижения",
        subtitle: "Достижения наших студентов",
      },
      footer: {
        about: "A+ Academy - современный учебный центр",
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
        courses: "Courses",
        teachers: "Teachers",
        about: "About",
        events: "Events",
        schedule: "Schedule",
        achievements: "Achievements",
        contact: "Contact",
        register: "Enroll in Course"
      },
      hero: {
        title: "Knowledge for Your Future",
        subtitle: "Professional teachers, modern curriculum, and guaranteed results",
        registerBtn: "Enroll in Courses",
        viewCoursesBtn: "View Courses",
        badge: "Professional Education",
        live: "Live Classes",
        certified: "Successful Students",
        flexible: "Flexible Schedule"
      },
      stats: {
        students: "Students",
        years: "Years Experience",
        courses: "Courses",
        graduates: "Graduates"
      },
      courses: {
        title: "Our Courses",
        subtitle: "Professional education in various fields",
        filter: "Filter",
        all: "All",
        it: "IT Courses",
        languages: "Languages",
        exams: "For Applicants",
        duration: "Duration",
        price: "Price",
        level: "Level",
        teacher: "Teacher",
        viewDetails: "View Details",
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
        noCourses: "No courses found"
      },
      common: {
        loading: "Loading..."
      },
      teachers: {
        title: "Our Teachers",
        subtitle: "Qualified and experienced specialists",
        experience: "years experience",
        viewProfile: "View More"
      },
      testimonials: {
        title: "Student Reviews",
        subtitle: "What our graduates say about us"
      },
      events: {
        title: "Events and News",
        subtitle: "Latest news from our learning center",
        readMore: "Read More"
      },
      register: {
        title: "Enroll in Courses",
        subtitle: "Register and start learning",
        fullName: "Full Name",
        age: "Age",
        phone: "Phone Number",
        selectCourse: "Select Course",
        submit: "Submit",
        success: "Your application has been submitted! We will contact you soon.",
        error: "Error",
        loading: "Submitting..."
      },
      contact: {
        title: "Contact Us",
        subtitle: "Have questions? Get in touch with us",
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
        advantages: "Our Advantages",
        team: "Our Team"
      },
      schedule: {
        title: "Class Schedule",
        subtitle: "Weekly class schedule",
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
        title: "Achievements",
        subtitle: "Our students' achievements",
      },
      footer: {
        about: "A+ Academy - modern learning center",
        quickLinks: "Quick Links",
        followUs: "Follow Us",
        rights: "All rights reserved"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'uz',
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
