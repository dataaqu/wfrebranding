import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "WEFORWARD — You deal. We deliver.", description: "Air, sea, rail and road freight plus customs brokerage from Georgia to the world." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return (
    <html lang="en">
      <head>
        {/* the two weights used above the fold start downloading before CSS is parsed */}
        <link rel="preload" href="/assets/fonts/loos-wide-bold.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/assets/fonts/loos-wide-medium.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  ); }
