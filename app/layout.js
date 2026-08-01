"use client";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import "./globals.css";

function NavBar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="p-4 border-b border-gray-800">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">ConcertTix</Link>
        <button onClick={() => setOpen(!open)} className="md:hidden text-white text-2xl">☰</button>
        <div className="hidden md:flex space-x-4 text-sm items-center">
          <Link href="/events">Events</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/orders">My Orders</Link>
          {session ? (
            <>
              <span className="text-gray-400 text-xs">{session.user.email}</span>
              <button onClick={() => signOut()} className="bg-red-600 text-white px-3 py-1 rounded-full text-xs">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup" className="bg-white text-black px-3 py-1 rounded-full">Sign Up</Link>
            </>
          )}
        </div>
      </div>
      {open && (
        <div className="md:hidden mt-4 flex flex-col space-y-3 text-sm">
          <Link href="/events" onClick={() => setOpen(false)}>Events</Link>
          <Link href="/cart" onClick={() => setOpen(false)}>Cart</Link>
          <Link href="/orders" onClick={() => setOpen(false)}>My Orders</Link>
          {session ? (
            <>
              <span className="text-gray-400 text-xs">{session.user.email}</span>
              <button onClick={() => { signOut(); setOpen(false); }} className="bg-red-600 text-white px-3 py-1 rounded-full text-xs w-fit">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="bg-white text-black px-3 py-1 rounded-full w-fit">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <SessionProvider>
          <NavBar />
          <main className="p-4 md:p-6">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}