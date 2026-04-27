import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARIA - AI Postmortem Generator",
  description: "Automatically generate blameless postmortems from incident data",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
