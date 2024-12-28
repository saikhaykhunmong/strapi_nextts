"use client";
import Header from "@/src/features/shared/Header";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <main>
        <Header/>
        {children}
    </main>
  );
}
