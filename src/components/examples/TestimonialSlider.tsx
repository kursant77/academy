import { TestimonialSlider } from "../TestimonialSlider";

export default function TestimonialSliderExample() {
  const testimonials = [
    {
      id: "1",
      name: "Ali Karimov",
      course: "Frontend Development",
      text: "IELTS Imperia o'quv markazida o'qish mening hayotimni o'zgartirdi. Professional o'qituvchilar va zamonaviy dastur tufayli men orzuimdagi ishga joylashdim.",
    },
    {
      id: "2",
      name: "Madina Yusupova",
      course: "IELTS Preparation",
      text: "IELTS kursida o'qib 7.5 ball oldim. O'qituvchilar juda malakali va har bir talabaga alohida e'tibor berishadi.",
    },
    {
      id: "3",
      name: "Sardor Rahimov",
      course: "Python Programming",
      text: "Python dasturlash kursini tugatgandan so'ng, men mustaqil loyihalar yaratishni boshladim. Kurs juda amaliy va tushunarli tarzda tashkil etilgan.",
    },
  ];

  return <TestimonialSlider testimonials={testimonials} />;
}
