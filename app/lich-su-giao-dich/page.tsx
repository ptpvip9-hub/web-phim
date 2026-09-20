"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  type: "vip" | "movie";
  title: string;
  amount: number;
  status: string;
  order_code: string;
  created_at: string;
  movie_slug?: string;
};

export default function LichSuGiaoDichPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/dang-nhap");
        return;
      }

      const [vipResult, movieResult] = await Promise.all([
        supabase
          .from("vip_orders")
          .select(
            "id, package_months, amount, order_code, status, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("movie_orders")
          .select(
            "id, movie_slug, movie_title, amount, order_code, status, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          }),
      ]);

      const list: Transaction[] = [];

      if (!vipResult.error) {
        (vipResult.data ?? []).forEach((item) => {
          list.push({
            id: `vip-${item.id}`,
            type: "vip",
            title: `VIP ${item.package_months} tháng`,
            amount: item.amount,
            status: item.status,
            order_code: item.order_code,
            created_at: item.created_at,
          });
        });
      }

      if (!movieResult.error) {
        (movieResult.data ?? []).forEach((item) => {
          list.push({
            id: `movie-${item.id}`,
            type: "movie",
            title: item.movie_title,
            amount: item.amount,
            status: item.status,
            order_code: item.order_code,
            created_at: item.created_at,
            movie_slug: item.movie_slug,
          });
        });
      }

      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setTransactions(list);
      setLoading(false);
    }

    loadTransactions();
  }, [router]);

  function formatDate(date: string) {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  }

  function getStatus(status: string) {
    if (status === "approved") {
      return {
        text: "✓ Thành công",
        className:
          "border-green-500/20 bg-green-500/10 text-green-400",
      };
    }

    if (status === "rejected") {
      return {
        text: "✕ Từ chối",
        className:
          "border-red-500/20 bg-red-500/10 text-red-400",
      };
    }

    return {
      text: "⏳ Đang xử lý",
      className:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    };
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="text-gray-400">
          Đang tải lịch sử giao dịch...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-5xl px-5 py-10 md:py-14">

        {/* QUAY LẠI */}
        <Link
          href="/tai-khoan"
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111] px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-white/20 hover:text-white"
        >
          ← Quay lại tài khoản
        </Link>

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
            TRÀ ĐÁ DRAMA
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-4xl">
            💳 Lịch sử giao dịch
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Theo dõi các giao dịch VIP và mua phim
            của tài khoản.
          </p>
        </div>

        {/* TRỐNG */}
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111] px-6 py-16 text-center">
            <div className="text-5xl">💳</div>

            <h2 className="mt-5 text-xl font-black">
              Chưa có giao dịch
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Các giao dịch của bạn sẽ xuất hiện tại đây.
            </p>

            <Link
              href="/phim"
              className="mt-7 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500"
            >
              🎬 Khám phá phim
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((item) => {
              const status = getStatus(item.status);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-[#111] p-5 transition hover:border-white/20"
                >
                  {/* TOP */}
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    {/* ICON + TÊN */}
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          item.type === "vip"
                            ? "bg-yellow-500/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {item.type === "vip" ? "👑" : "🎬"}
                      </div>

                      <div className="min-w-0">
                        <div className="font-black">
                          {item.title}
                        </div>

                        <div className="mt-1 text-xs text-gray-600">
                          {item.type === "vip"
                            ? "Đăng ký thành viên VIP"
                            : "Mua riêng bộ phim"}
                        </div>
                      </div>
                    </div>

                    {/* GIÁ + STATUS */}
                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                      <div className="text-lg font-black">
                        {formatPrice(item.amount)}
                      </div>

                      <div
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                      >
                        {status.text}
                      </div>
                    </div>
                  </div>

                  {/* CHI TIẾT */}
                  <div className="mt-5 grid gap-4 border-t border-white/10 pt-4 text-xs sm:grid-cols-2">
                    <div>
                      <span className="text-gray-600">
                        Mã đơn:
                      </span>

                      <div className="mt-1 break-all font-bold text-gray-400">
                        {item.order_code}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600">
                        Thời gian:
                      </span>

                      <div className="mt-1 text-gray-400">
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* MOVIE ĐÃ MUA */}
                  {item.status === "approved" &&
                    item.type === "movie" && (
                      <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                        <div className="text-sm font-bold text-green-400">
                          ✓ Đã mở khóa vĩnh viễn
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          Bạn có thể xem bộ phim này không
                          giới hạn thời gian.
                        </div>

                        {item.movie_slug && (
                          <Link
                            href={`/phim/${item.movie_slug}`}
                            className="mt-3 inline-flex rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-500"
                          >
                            🎬 Xem phim
                          </Link>
                        )}
                      </div>
                    )}

                  {/* VIP */}
                  {item.status === "approved" &&
                    item.type === "vip" && (
                      <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                        <div className="text-sm font-bold text-yellow-400">
                          👑 Gói VIP đã được kích hoạt
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          VIP cho phép bạn xem toàn bộ phim
                          trong thời gian còn hiệu lực.
                        </div>

                        <Link
                          href="/tai-khoan"
                          className="mt-3 inline-flex rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs font-bold text-yellow-400 transition hover:bg-yellow-500/20"
                        >
                          👑 Xem thông tin VIP
                        </Link>
                      </div>
                    )}

                  {/* ĐANG XỬ LÝ */}
                  {item.status !== "approved" &&
                    item.status !== "rejected" && (
                      <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs font-semibold text-yellow-400">
                        ⏳ Giao dịch đang được xử lý. Vui
                        lòng chờ hệ thống xác nhận thanh toán.
                      </div>
                    )}

                  {/* TỪ CHỐI */}
                  {item.status === "rejected" && (
                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-semibold text-red-400">
                      ✕ Giao dịch chưa được xác nhận.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* LINK PHIM CỦA TÔI */}
        {transactions.some(
          (item) =>
            item.type === "movie" &&
            item.status === "approved"
        ) && (
          <div className="mt-8 text-center">
            <Link
              href="/phim-cua-toi"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111] px-5 py-3 text-sm font-bold text-gray-300 transition hover:border-white/20 hover:text-white"
            >
              🎬 Xem tất cả phim của tôi →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}