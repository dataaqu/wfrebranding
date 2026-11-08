import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "WEFORWARD — You deal. We deliver.", description: "Air, sea, rail and road freight plus customs brokerage from Georgia to the world." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
