import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Codrava | Ecosistema de Prospección",
  description: "Plataforma inteligente de prospección empresarial"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.className} bg-[#0B0B0E] text-[#EDEDED] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
