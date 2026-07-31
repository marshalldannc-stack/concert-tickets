"use client";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import "./globals.css";

function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="p-4 border-b border-gray-800 flex justify-between items-center">
      <a href="/" className="text-xl font-bold">ConcertTix</a>
      <div className="space-x-4 text-sm flex items-center">
        <a href="/events">Events</a>
        <a href="/cart">Cart</a>
        <a href="/orders">My Orders</a>
        <a href="/chat">Support</a>
        {session ? (
          <>
            <span className="text-gray-400">{session.user.email}</span>
            <button onClick={() => signOut()} className="bg-red-600 text-white px-3 py-1 rounded-full">Logout</button>
          </>
        ) : (
          <>
            <a href="/login">Login</a>
            <a href="/signup" className="bg-white text-black px-3 py-1 rounded-full">Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <SessionProvider>
          <NavBar />
          <main className="p-6">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
