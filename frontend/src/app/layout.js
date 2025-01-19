import { Geist } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "./components/navbar";

import "./globals.css";

const nf = localFont({
  src: [
    {
      path: "./fonts/nf.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/nfb.otf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-nf",
});
import { UserProvider } from "@auth0/nextjs-auth0/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Adgen",
  description: "The ultimate ad generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <UserProvider>
        <body className={`${geistSans.variable} ${nf.variable} antialiased`}>
          <Navbar></Navbar>
          {children}
        </body>
      </UserProvider>
    </html>
  );
}
