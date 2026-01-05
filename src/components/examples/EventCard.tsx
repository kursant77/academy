import { EventCard } from "../EventCard";

export default function EventCardExample() {
  return (
    <div className="max-w-sm">
      <EventCard
        id="1"
        title="Sertifikat topshirish marosimi"
        description="2024-yil Frontend Development kursini muvaffaqiyatli tugatgan talabalarga sertifikat topshiriladi"
        date={new Date("2024-12-15")}
        category="Graduation"
      />
    </div>
  );
}
