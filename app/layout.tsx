import type { Metadata } from "next";
import "./globals.css";
import "./experience.css";
import { SiteMotion } from "./site-motion";
import { SharedHeader } from "./shared-header";
import { ImageCacheRegister } from "./image-cache-register";

export const metadata: Metadata = {
  metadataBase: new URL("https://nadon-klinton.vercel.app"),
  title: "Nadon Klinton | Photographer & Filmmaker",
  description:
    "A cinematic photography landing page for portraits, weddings, brand campaigns, and editorial stories.",
  openGraph: {
    title: "Nadon Klinton | Photographer & Filmmaker",
    description:
      "Cinematic photography and film for portraits, weddings, campaigns, and meaningful stories.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script 
          async 
          src="https://www.nibgate.xyz/widget.js" 
          data-nibgate-site="87f387c0-cff5-4deb-b8aa-c23cfd229d09" 
          data-nibgate-token="67a4386e4c377734a27e759d42502d5c" 
          data-nibgate-api="https://api.nibgate.xyz" 
        ></script>
      </head>
      <body>
        <ImageCacheRegister />
        <SharedHeader />
        <SiteMotion />
        {children}
        {/* SwiftBook chat widget is temporarily disabled:
            1. loader.js appends an invisible fixed full-screen #swiftbook-backdrop (z-index 2147482999) without pointer-events: none, which blocks all clicks on the website.
            2. https://swift-book.base44.app/embed/chat sends 'X-Frame-Options: DENY', which causes browsers to refuse loading the iframe (crashed icon).
            Re-enable once SwiftBook fixes their loader.js CSS and allows iframe embedding. */}
      </body>
    </html>
  );
}
