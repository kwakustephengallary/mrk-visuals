import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MR.K Visuals | Premium Photography",
  description: "Professional photography and client galleries by MR.K Visuals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 bg-white z-50 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-xl font-semibold">
                MR.K VISUALS
              </Link>
              <div className="flex space-x-6">
                <Link href="/" className="text-gray-600 hover:text-black">Home</Link>
                <Link href="/portfolio" className="text-gray-600 hover:text-black">Portfolio</Link>
                <Link href="/gallery" className="text-gray-600 hover:text-black">Gallery</Link>
                <Link href="/contact" className="text-gray-600 hover:text-black">Contact</Link>
                <Link href="/admin/login" className="text-gray-400 hover:text-black text-sm">Admin</Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}