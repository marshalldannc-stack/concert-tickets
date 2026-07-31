import Link from "next/link";

const events = [
  { id: "1", title: "Summer Jam Festival", date: "Aug 25, 2026", venue: "Madison Square Garden, NYC", price: "From $50", image: "🎵" },
  { id: "2", title: "Jazz Under the Stars", date: "Sep 10, 2026", venue: "Hollywood Bowl, LA", price: "From $75", image: "🎷" },
  { id: "3", title: "Electric Nights Tour", date: "Sep 30, 2026", venue: "United Center, Chicago", price: "From $60", image: "🔥" },
];

export default function EventsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} className="border border-gray-700 rounded-xl p-4 hover:border-white transition">
            <div className="text-4xl mb-4">{event.image}</div>
            <h2 className="text-lg font-bold">{event.title}</h2>
            <p className="text-gray-400">{event.date}</p>
            <p className="text-gray-500 text-sm">{event.venue}</p>
            <p className="text-white font-semibold mt-2">{event.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}