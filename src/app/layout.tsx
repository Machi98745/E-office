import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { EOfficeProvider } from "@/context/EOfficeContext";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "E-Office Interactive Prototype | ระบบสำนักงานอิเล็กทรอนิกส์",
  description:
    "Interactive Web Prototype สาธิตการทำงานระบบ E-Office (Flow & Stack) ครอบคลุมระบบสารบรรณ e-Document/Approval และระบบลางาน e-Leave",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={prompt.variable}>
      <body className="font-sans antialiased min-h-screen bg-slate-50 text-slate-900">
        <EOfficeProvider>{children}</EOfficeProvider>
      </body>
    </html>
  );
}
