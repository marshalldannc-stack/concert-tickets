import "./globals.css";

export const metadata = {
  title: "Concert Tickets",
  description: "Buy concert tickets with crypto",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <nav className="p-4 border-b border-gray-800 flex justify-between">
          <a href="/" className="text-xl font-bold">ConcertTix</a>
          <div className="space-x-4">
            <a href="/events">Events</a>
            <a href="/cart">Cart</a>
            <a href="/orders">My Orders</a>
            <a href="/chat">Support</a>
            <a href="/admin">Admin</a>
          </div>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
