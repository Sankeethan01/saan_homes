import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./styles/globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SAAN HOMES - Building Dreams, One Home at a Time.",
  description: "SAAN HOMES - Building Dreams, One Home at a Time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubik.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}