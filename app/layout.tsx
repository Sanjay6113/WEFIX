import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";
import { SiteContentProvider } from "@/components/site-content";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
export const dynamic = "force-dynamic";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WeFix | Tech Advisors & Repair Specialists",
  description:
    "Premium PC builds, expert hardware repairs, transparent pricing, and priority tech advisor consultations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getContent();
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable}`}>
        <SiteContentProvider content={content}>{children}</SiteContentProvider>
      </body>
    </html>
  );
}
