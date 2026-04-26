import type { Metadata } from "next";
import { Caveat, Patrick_Hand } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-sketch-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-sketch-body",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "MaaSaheli V2 | AI for Maternal Health",
  description: "Predictive AI and logistics for frontline ASHA workers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${patrickHand.variable} h-full`}
    >
      <body className="min-h-full flex flex-col sketch-theme">{children}</body>
    </html>
  );
}
