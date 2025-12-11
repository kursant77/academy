import { TeacherCard } from "../TeacherCard";

export default function TeacherCardExample() {
  return (
    <div className="max-w-sm">
      <TeacherCard
        id="1"
        name="Sarah Johnson"
        specialty="English Language"
        experience={8}
        bio="Experienced English teacher with passion for helping students achieve their language goals"
        linkedIn="https://linkedin.com"
        telegram="https://t.me"
        instagram="https://instagram.com"
      />
    </div>
  );
}
