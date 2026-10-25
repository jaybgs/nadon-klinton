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
        <script
          async
          src="https://swift-book.base44.app/loader.js"
          data-swiftbook-site="pub_33fccfbd114d4d0495612a3dc76e9ed4"
        ></script>
      </body>
    </html>
  );
}
