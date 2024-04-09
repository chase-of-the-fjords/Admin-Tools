import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Origin Golf Admin Tools",
  description: "For Origin Golf",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/soh6cnl.css" />
      </head>
      <body className="bg-cool-grey-100">{children}</body>
    </html>
  );
}
