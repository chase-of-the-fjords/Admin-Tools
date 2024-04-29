import "./globals.css";
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata = {
  title: "Origin Golf Admin Tools",
  description: "For Origin Golf",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`}>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/soh6cnl.css" />
      </head>
      <body className="bg-cool-grey-100">{children}</body>
    </html>
  );
}
