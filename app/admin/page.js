export default function AdminPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold">Customer Support</h2>
          <p className="text-gray-400 text-sm mt-2">View customer messages</p>
          <a href="/chat" className="text-blue-400 text-sm mt-2 block">Open Support Chat</a>
        </div>
        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold">Manual Pricing</h2>
          <p className="text-gray-400 text-sm mt-2">Set ticket prices</p>
          <a href="/admin/pricing" className="text-blue-400 text-sm mt-2 block">Manage Prices</a>
        </div>
        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold">Phone Number</h2>
          <p className="text-xl font-bold mt-2">+1 (251) 829-7805</p>
          <p className="text-gray-400 text-xs mt-1">Displayed on support page</p>
        </div>
        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold">Orders</h2>
          <a href="/orders" className="text-blue-400 text-sm mt-2 block">View Orders</a>
        </div>
      </div>
    </div>
  );
}