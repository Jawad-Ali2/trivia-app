import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TriviaProvider from "@/store/TriviaProvider";
import AuthProvider from "@/store/AuthProvider";
import SocketProvider from "@/store/SocketProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Trivia app",
  description:
    "An online multiplayer trivia websites where you can play along with your friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <AuthProvider>
          <TriviaProvider>
            {/* <SocketProvider> */}
              <Navbar />
              {children}
            {/* </SocketProvider> */}
          </TriviaProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
