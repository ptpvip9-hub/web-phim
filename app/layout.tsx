import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "TRÀ ĐÁ DRAMA",
  description: "Trà Đá Drama - Xem phim hay mỗi ngày",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}