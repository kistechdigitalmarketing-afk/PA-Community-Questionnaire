import type { Metadata } from "next";
import { Roboto, Roboto_Slab } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "PA Community Questionnaire | Possibilities Africa",
  description:
    "Official Community Activity & Meeting Questionnaire Portal for Possibilities Africa.",
  icons: {
    icon: "https://africa.possibilitiesafrica.org/wp-content/uploads/2024/09/cropped-favicon-32x32.png",
    shortcut: "https://africa.possibilitiesafrica.org/wp-content/uploads/2024/09/cropped-favicon-192x192.png",
    apple: "https://africa.possibilitiesafrica.org/wp-content/uploads/2024/09/cropped-favicon-180x180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${robotoSlab.variable}`}>
      <body style={{ fontFamily: "var(--font-roboto), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
