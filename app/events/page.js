import Link from "next/link";

const events = [
  { id: "1", title: "Afrobeats Fest 2026", date: "Aug 15, 2026", venue: "Eko Hotel, Lagos", price: "From 5,000 NGN", image: "🎵" },
  { id: "2", title: "Lagos Jazz Night", date: "Sep 2, 2026", venue: "Terra Kulture, Lagos", price: "From 10,000 NGN", image: "🎷" },
  { id: "3", title: "Amapiano Explosion", date: "Sep 20, 2026", venue: "Balmoral Convention Center", price: "From 7,500 NGN", image: "🔥" },
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