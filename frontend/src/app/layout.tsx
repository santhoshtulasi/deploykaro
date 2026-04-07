import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DeployKaro — Learn DevOps in Your Language",
  description:
    "India's first regional-language AI DevOps mentor. Learn Docker, Kubernetes, CI/CD and cloud in Tamil, Kannada, Telugu, or English — with animated analogies and NVIDIA-powered AI.",
  keywords: "DevOps, MLOps, Kubernetes, Docker, AWS, GCP, Azure, Tamil, Kannada, Telugu, AI Mentor, India",
  openGraph: {
    title: "DeployKaro — Learn DevOps in Your Language",
    description: "Guided by ANNA, BHAI, DIDI, or BUDDY — your AI mentor that explains cloud like you're 10, in your mother tongue.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
