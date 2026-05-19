import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Hey — Messages that feel alive",
  description: "Hey is a premium realtime messaging app. Chat with friends, make calls, and express yourself with beautiful themes and animations.",
  keywords: ["messaging", "chat", "real-time", "Hey", "WhatsApp alternative"],
  authors: [{ name: "Hey Team" }],
  openGraph: {
    title: "Hey — Messages that feel alive ✨",
    description: "Premium messaging that feels alive. Chat, call, express yourself.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
