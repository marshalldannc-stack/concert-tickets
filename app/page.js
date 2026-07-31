import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold mb-4">Concert Tickets</h1>
      <p className="text-gray-400 mb-8">Buy tickets with crypto. Fast and easy.</p>
      <Link href="/events" className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200">
        Browse Events
      </Link>
    </div>
  );
}