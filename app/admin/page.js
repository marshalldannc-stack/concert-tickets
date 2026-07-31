import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold">Total Events</h2>
          <p className="text-3xl font-bold mt-2">3</p>
          <Link href="/events" className="text-blue-400 text-sm mt-2 block">Manage Events</Link>
        </div>
        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold">Orders</h2>
          <p className="text-3xl font-bold mt-2">0</p>
          <a href="/chat" className="text-blue-400 text-sm mt-2 block">View Support Chats</a>
        </div>
        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold">Live Support</h2>
          <a href="/chat" className="bg-white text-black px-4 py-2 rounded-full mt-2 inline-block text-sm">Open Chat</a>
        </div>
      </div>
    </div>
  );
}