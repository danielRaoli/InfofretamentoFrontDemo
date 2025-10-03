"use client"
import { Raleway } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./layoutWrapper";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

const raleway = Raleway({
  subsets: ["latin-ext"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={` ${raleway.className} antialiased`}>
        <QueryClientProvider client={queryClient}>
        <LayoutWrapper>{children}</LayoutWrapper>
        </QueryClientProvider>
      </body>
    </html>
  );
}
