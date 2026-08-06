import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-zoa-sans",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-zoa-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zoa — Business registrations",
  description:
    "File CAC company, incorporated trustees, and related workflows with guided forms and document uploads.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
