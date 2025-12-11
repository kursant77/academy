import { CourseCard } from "../CourseCard";

export default function CourseCardExample() {
  return (
    <div className="max-w-sm">
      <CourseCard
        id="1"
        name="Frontend Development"
        description="Learn modern web development with React, TypeScript, and Tailwind CSS"
        category="IT"
        duration="3 months"
        price="$299"
        level="Intermediate"
        teacherName="John Smith"
      />
    </div>
  );
}
