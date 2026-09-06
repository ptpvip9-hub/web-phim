import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}